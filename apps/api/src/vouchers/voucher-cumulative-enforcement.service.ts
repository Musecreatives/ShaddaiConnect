import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * `Session-Timeout` (set at issuance, see VouchersService.issueInTx) only caps a single
 * connection — a customer who disconnects and reconnects gets a fresh per-session allowance
 * each time, so an "hourly" voucher could otherwise grant far more than its advertised total
 * (business decision, 2026-07-23: hourly plans should mean N hours total, not N hours per
 * sitting). This sweeps active hourly vouchers, sums their real connected time across every
 * radacct row (read-only — FreeRADIUS owns writes to it), and expires the voucher once its
 * cumulative usage reaches what it was actually granted at issuance.
 *
 * Reads the allowance from the voucher's own `radreply` Session-Timeout row rather than the
 * plan's current `durationHours` — this is what was actually promised to this specific voucher
 * at issuance (correct even if the plan's duration changes later, and correct for the free
 * trial's 20-minute override, which isn't a whole-hours value stored anywhere else).
 */
@Injectable()
export class VoucherCumulativeEnforcementService {
  private readonly logger = new Logger(VoucherCumulativeEnforcementService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/2 * * * *')
  async enforceCumulativeUsage(): Promise<void> {
    const activeHourly = await this.prisma.voucher.findMany({
      where: { status: 'active', plan: { planType: 'hourly' } },
      select: { id: true, code: true },
    });
    if (activeHourly.length === 0) return;

    const codes = activeHourly.map((v) => v.code);

    const [allowances, usage] = await Promise.all([
      this.prisma.radReply.findMany({
        where: { username: { in: codes }, attribute: 'Session-Timeout' },
        select: { username: true, value: true },
      }),
      this.prisma.radAcct.groupBy({
        by: ['username'],
        where: { username: { in: codes } },
        _sum: { acctSessionTime: true },
      }),
    ]);

    const allowanceByCode = new Map(allowances.map((a) => [a.username, Number(a.value)]));
    const usedByCode = new Map(usage.map((u) => [u.username, u._sum.acctSessionTime ?? 0]));

    let expiredCount = 0;
    for (const voucher of activeHourly) {
      const allowance = allowanceByCode.get(voucher.code);
      // No Session-Timeout row to compare against — can't safely judge, skip rather than guess.
      if (!allowance) continue;
      const used = usedByCode.get(voucher.code) ?? 0;
      if (used < allowance) continue;

      await this.prisma.$transaction(async (tx) => {
        // Same neutralization disable() uses — no radcheck rows means FreeRADIUS can't
        // authenticate this code again, regardless of what's left in radreply.
        await tx.radCheck.deleteMany({ where: { username: voucher.code } });
        await tx.voucher.update({ where: { id: voucher.id }, data: { status: 'expired' } });
      });
      expiredCount++;
    }

    if (expiredCount > 0) {
      this.logger.log(`Expired ${expiredCount} voucher(s) — cumulative time allowance reached.`);
    }
  }
}
