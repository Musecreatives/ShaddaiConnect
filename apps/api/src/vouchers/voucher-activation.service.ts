import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuditService } from '../audit/audit.service';
import { CoaService } from '../coa/coa.service';
import { NtfyService } from '../ntfy/ntfy.service';
import { PfsenseService } from '../pfsense/pfsense.service';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';
import { TRIAL_PLAN_NAME } from '../trial/trial.constants';
import { VouchersService } from './vouchers.service';

/**
 * Nothing in the issuance/RADIUS-auth path ever marks a voucher `active` — it's created
 * `unused` and stays that way until this job notices real usage. Polls `radacct` (read-only,
 * per CLAUDE.md — FreeRADIUS owns writes to it) rather than hooking into the auth path directly,
 * since that would mean modifying FreeRADIUS's own config, out of this repo's scope.
 */
@Injectable()
export class VoucherActivationService {
  private readonly logger = new Logger(VoucherActivationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchers: VouchersService,
    private readonly ntfy: NtfyService,
    private readonly push: PushService,
    private readonly coa: CoaService,
    private readonly audit: AuditService,
    private readonly pfsense: PfsenseService,
  ) {}

  @Cron('*/30 * * * * *')
  async activateUsedVouchers(): Promise<void> {
    const unused = await this.prisma.voucher.findMany({
      where: { status: 'unused' },
      select: { id: true, code: true, planId: true },
    });
    if (unused.length === 0) return;

    const codes = unused.map((v) => v.code);
    const firstUse = await this.prisma.radAcct.groupBy({
      by: ['username'],
      where: { username: { in: codes } },
      _min: { acctStartTime: true },
    });
    if (firstUse.length === 0) return;

    const firstUseByCode = new Map(firstUse.map((row) => [row.username, row._min.acctStartTime]));

    const justActivated: { id: number; code: string; planId: number }[] = [];
    for (const voucher of unused) {
      if (!firstUseByCode.has(voucher.code)) continue;
      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          status: 'active',
          activatedAt: firstUseByCode.get(voucher.code) ?? new Date(),
        },
      });
      justActivated.push(voucher);
    }

    if (justActivated.length > 0) {
      this.logger.log(`Activated ${justActivated.length} voucher(s) based on real radacct usage.`);
      for (const voucher of justActivated) {
        this.push.sendToVoucher(voucher.code, {
          title: "You're connected!",
          body: 'Your voucher is now active. Enjoy your session.',
          tag: 'activated',
        });
      }
    }

    const blocklistCount = await this.blockDenylistedDevices(justActivated);
    if (blocklistCount > 0) {
      this.logger.warn(`Disabled ${blocklistCount} voucher(s) — device on the admin blocklist.`);
    }

    const trialAbuseCount = await this.blockRepeatTrialDevices(justActivated);
    if (trialAbuseCount > 0) {
      this.logger.warn(`Blocked ${trialAbuseCount} repeat free-trial device(s).`);
    }

    await this.recordDeviceSightings(justActivated);
  }

  /**
   * Persists the MAC seen on each newly-activated voucher into `devices` — pure analytics
   * (CLAUDE.md: devices table is analytics only, never enforcement). Runs once per voucher
   * (activation is a one-time unused->active transition), so no dedup/upsert is needed. Backs
   * the admin-visible "has this device used Free Trial before" view
   * (TrialFeedbackService.findRepeatTrialDevices) — previously this table was defined but never
   * written to.
   */
  private async recordDeviceSightings(
    justActivated: { id: number; code: string; planId: number }[],
  ): Promise<void> {
    if (justActivated.length === 0) return;

    const codes = justActivated.map((v) => v.code);
    const sessions = await this.prisma.radAcct.findMany({
      where: { username: { in: codes }, callingStationId: { not: '' } },
      select: { username: true, callingStationId: true },
    });
    const voucherIdByCode = new Map(justActivated.map((v) => [v.code, v.id]));

    for (const session of sessions) {
      const voucherId = voucherIdByCode.get(session.username);
      if (!voucherId) continue;
      await this.prisma.device.create({
        data: { voucherId, macAddress: session.callingStationId },
      });
    }
  }

  /**
   * Admin-managed MAC blocklist (blocked_macs table, apps/admin's Blocklist page) — applies to
   * every plan, not just Free Trial. Same disable-on-activation mechanism as the trial guard:
   * catches the connection that just happened, disables radcheck so the *next* one fails.
   */
  private async blockDenylistedDevices(
    justActivated: { id: number; code: string; planId: number }[],
  ): Promise<number> {
    const blockedMacs = await this.prisma.blockedMac.findMany({ select: { macAddress: true } });
    if (blockedMacs.length === 0) return 0;
    const blockedSet = new Set(blockedMacs.map((b) => b.macAddress));

    const codes = justActivated.map((v) => v.code);
    const sessions = await this.prisma.radAcct.findMany({
      where: { username: { in: codes }, callingStationId: { not: '' } },
      select: { username: true, callingStationId: true },
    });
    const macByCode = new Map(sessions.map((s) => [s.username, s.callingStationId]));

    let blocked = 0;
    for (const voucher of justActivated) {
      const mac = macByCode.get(voucher.code)?.toLowerCase();
      if (!mac || !blockedSet.has(mac)) continue;

      await this.vouchers.disable(voucher.id);
      const kick = await this.pfsense.disconnect(voucher.code);
      this.logger.warn(
        `Disabled ${voucher.code} — device ${mac} is on the admin blocklist. ${kick.message}`,
      );
      this.ntfy.publish({
        title: 'Blocked device tried to reconnect',
        message: `${voucher.code} disabled — device ${mac} is blocklisted`,
        tags: ['no_entry_sign'],
      });
      blocked++;
    }

    return blocked;
  }

  /**
   * Free-trial abuse guard — a scoped, documented exception to CLAUDE.md's "MACs are analytics
   * only" rule. Observed abuse pattern: one physical device claiming the 20-minute free trial
   * repeatedly under different phone/email registrations. Compares each newly-activated trial
   * voucher's session MAC against every other Free Trial voucher's session history; if that MAC
   * already appears on a different trial code, the new voucher is disabled immediately
   * (radcheck removed via VouchersService.disable — same path as a manual admin disable) so it
   * can't reconnect, AND the session it just opened is kicked immediately via PfsenseService.
   * That second half matters: disabling alone only stopped the *next* login, so a repeat claimer
   * still got the full 20-minute session before anything took effect (observed 2026-08-30 —
   * SHADDAI-4PM2P and SHADDAI-93VNB each ran a complete session after being disabled within a
   * minute). Now a repeat claim is worth seconds, which is the actual deterrent.
   *
   * Deliberately does NOT auto-add the MAC to pfSense's captive-portal block list: that would
   * also lock the device out of any plan it later pays for. Portal-level MAC blocking stays an
   * explicit admin action (Blocklist page / "Block device"), which now really works.
   */
  private async blockRepeatTrialDevices(
    justActivated: { id: number; code: string; planId: number }[],
  ): Promise<number> {
    const trialPlan = await this.prisma.plan.findFirst({ where: { name: TRIAL_PLAN_NAME } });
    if (!trialPlan) return 0;

    const activatedTrialVouchers = justActivated.filter((v) => v.planId === trialPlan.id);
    if (activatedTrialVouchers.length === 0) return 0;

    const allTrialVouchers = await this.prisma.voucher.findMany({
      where: { planId: trialPlan.id },
      select: { code: true },
    });
    const trialCodes = allTrialVouchers.map((v) => v.code);

    const trialSessions = await this.prisma.radAcct.findMany({
      where: { username: { in: trialCodes }, callingStationId: { not: '' } },
      select: { username: true, callingStationId: true },
      orderBy: { acctStartTime: 'asc' },
    });

    // First code to use a given MAC "wins" — every later trial code seen on that same MAC is
    // the abuse case this guard exists for.
    const macFirstCode = new Map<string, string>();
    for (const session of trialSessions) {
      if (!macFirstCode.has(session.callingStationId)) {
        macFirstCode.set(session.callingStationId, session.username);
      }
    }

    let blocked = 0;
    for (const voucher of activatedTrialVouchers) {
      const ownSession = trialSessions.find((s) => s.username === voucher.code);
      const mac = ownSession?.callingStationId;
      if (!mac) continue;

      const firstCodeForMac = macFirstCode.get(mac);
      if (firstCodeForMac && firstCodeForMac !== voucher.code) {
        await this.vouchers.disable(voucher.id);
        const kick = await this.pfsense.disconnect(voucher.code);
        this.logger.warn(
          `Disabled ${voucher.code} — device ${mac} already used free trial on ${firstCodeForMac}. ${kick.message}`,
        );
        this.ntfy.publish({
          title: 'Blocked repeat free-trial device',
          message: `${voucher.code} disabled — same device already used trial ${firstCodeForMac}`,
          tags: ['no_entry_sign'],
        });
        await this.audit.record({
          adminEmail: 'system',
          action: 'auto_block_repeat_trial',
          targetType: 'voucher',
          targetId: voucher.code,
          detail: `device ${mac} already claimed trial on ${firstCodeForMac} — ${kick.message}`,
        });
        blocked++;
      }
    }

    return blocked;
  }

  /**
   * Kicks devices still online under a voucher that is no longer valid (expired/disabled) —
   * pfSense/FreeRADIUS sometimes never sends Accounting-Stop (dropped AP, abrupt disconnect), so
   * the radacct row stays open and the device keeps browsing after its voucher died.
   *
   * Goes through PfsenseService (pfSense's own captiveportal_disconnect_client) rather than
   * CoaService: pfSense's captive portal never implemented RADIUS CoA (Redmine #13625), so every
   * Disconnect-Request timed out and this cron was a no-op that only spammed the audit log.
   *
   * The old second case — a *valid* voucher with more open radacct rows than its Simultaneous-Use
   * limit — is deliberately gone. Those extra rows are an accounting artifact (a missing
   * Accounting-Stop), not real concurrent sessions, and pfSense is authoritative about who is
   * actually online. Disconnecting by voucher code kills every session for that code, so acting
   * on a still-valid voucher would have kicked the legitimate user off. pfSense's own Idle
   * Timeout + "Concurrent user logins: Last login" (both configured 2026-08-30) now close those
   * rows without help from here.
   *
   * Every ~60s. Never touches radacct directly (read-only per CLAUDE.md). disconnect() never
   * throws, so an unreachable firewall degrades this to a warning rather than killing the cron.
   */
  @Cron('0 * * * * *')
  async disconnectStaleSessions(): Promise<void> {
    if (!this.pfsense.isEnabled) return;

    const openCodes = await this.prisma.radAcct.findMany({
      where: { acctStopTime: null },
      select: { username: true },
      distinct: ['username'],
    });
    if (openCodes.length === 0) return;

    const staleVouchers = await this.prisma.voucher.findMany({
      where: {
        code: { in: openCodes.map((s) => s.username) },
        status: { in: ['expired', 'disabled'] },
      },
      select: { code: true, status: true },
    });
    if (staleVouchers.length === 0) return;

    for (const voucher of staleVouchers) {
      const result = await this.pfsense.disconnect(voucher.code);
      // Only record when a session was actually cut — otherwise this fires every 60s for every
      // stale radacct row forever, which is exactly what flooded the audit log before.
      if (!result.ok || !result.data || result.data.disconnected === 0) continue;

      this.logger.log(`Disconnected ${voucher.code} (${voucher.status}): ${result.message}`);
      await this.audit.record({
        adminEmail: 'system',
        action: 'auto_disconnect_stale_session',
        targetType: 'session',
        targetId: voucher.code,
        detail: `voucher ${voucher.status} — ${result.message}`,
      });
    }
  }
}
