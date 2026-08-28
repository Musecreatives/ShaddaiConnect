import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuditService } from '../audit/audit.service';
import { CoaService } from '../coa/coa.service';
import { NtfyService } from '../ntfy/ntfy.service';
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
      this.logger.warn(`Disabled ${voucher.code} — device ${mac} is on the admin blocklist.`);
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
   * can't reconnect. Doesn't touch an already-open session (no CoA/disconnect wired up anywhere
   * in this system) — this only stops the *next* connection attempt.
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
        this.logger.warn(
          `Disabled ${voucher.code} — device ${mac} already used free trial on ${firstCodeForMac}.`,
        );
        this.ntfy.publish({
          title: 'Blocked repeat free-trial device',
          message: `${voucher.code} disabled — same device already used trial ${firstCodeForMac}`,
          tags: ['no_entry_sign'],
        });
        blocked++;
      }
    }

    return blocked;
  }

  /**
   * Closes the "one connection slips through" / ghost-session gap: a voucher can be
   * disabled/expired while its radacct row stays open indefinitely if pfSense/FreeRADIUS never
   * sends Accounting-Stop (dropped AP, abrupt disconnect, stale NAS entry). Every ~60s, find
   * open sessions whose voucher is no longer active and attempt a live CoA kick. Never touches
   * radacct directly (read-only per CLAUDE.md) — the actual accounting-stop write, if any, is
   * still FreeRADIUS's. disconnectVoucher() never throws, so failures (e.g. pfSense not
   * listening on UDP 3799 yet) are logged and swallowed, not fatal to the cron.
   */
  @Cron('0 * * * * *')
  async disconnectStaleSessions(): Promise<void> {
    const openSessions = await this.prisma.radAcct.findMany({
      where: { acctStopTime: null },
      select: { username: true },
      distinct: ['username'],
    });
    if (openSessions.length === 0) return;

    const codes = openSessions.map((s) => s.username);
    const staleVouchers = await this.prisma.voucher.findMany({
      where: { code: { in: codes }, status: { in: ['expired', 'disabled'] } },
      select: { code: true },
    });
    if (staleVouchers.length === 0) return;

    for (const voucher of staleVouchers) {
      const result = await this.coa.disconnectVoucher(voucher.code);
      if (!result.attempted) continue;

      this.logger.log(`Stale-session disconnect for ${voucher.code}: ${result.message}`);
      await this.audit.record({
        adminEmail: 'system',
        action: 'auto_disconnect_stale_session',
        targetType: 'session',
        targetId: voucher.code,
        detail: result.message,
      });
    }
  }
}
