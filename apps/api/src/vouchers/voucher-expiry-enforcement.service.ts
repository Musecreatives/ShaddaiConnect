import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Closes a real gap: nothing anywhere in this codebase ever marked a monthly/weekly voucher
 * `expired` or removed its radcheck rows once `expiresAt` passed (found 2026-09-03 — a customer
 * whose device stayed connected past their paid period kept browsing indefinitely, silently).
 * `VoucherExpiryWarningService` only sends a "your plan expires soon" push — it never enforces
 * anything.
 *
 * Hourly plans don't need this: their RADIUS `Session-Timeout` is enforced live by the NAS mid-
 * session, so the connection is cut the moment the clock runs out. Monthly plans instead carry a
 * radcheck `Expiration` date, which FreeRADIUS only ever checks at the *next* Access-Request — it
 * does nothing to a session that's already open. So even with a perfectly correct Expiration
 * value, a device that never disconnects just keeps working past its paid period.
 *
 * This cron does the DB-side half — same neutralize-radcheck-and-flip-status pattern as
 * VouchersService.disable() — and that alone is enough to trigger the actual live kick:
 * VoucherActivationService.disconnectStaleSessions() already watches for
 * `status in ['expired','disabled']` with an open radacct session and force-disconnects via
 * pfSense. No new disconnect logic needed here, just the missing status transition that feeds it.
 */
@Injectable()
export class VoucherExpiryEnforcementService {
  private readonly logger = new Logger(VoucherExpiryEnforcementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Cron('0 */2 * * * *')
  async expireOverdueVouchers(): Promise<void> {
    const now = new Date();
    const overdue = await this.prisma.voucher.findMany({
      where: {
        status: { in: ['unused', 'active'] },
        plan: { planType: 'monthly' },
        expiresAt: { lt: now },
      },
      select: { id: true, code: true, expiresAt: true },
    });
    if (overdue.length === 0) return;

    for (const voucher of overdue) {
      await this.prisma.$transaction(async (tx) => {
        await tx.radCheck.deleteMany({ where: { username: voucher.code } });
        await tx.voucher.update({ where: { id: voucher.id }, data: { status: 'expired' } });
      });

      this.logger.log(
        `Expired ${voucher.code} — validity ended ${voucher.expiresAt?.toISOString()}`,
      );
      await this.audit.record({
        adminEmail: 'system',
        action: 'auto_expire_voucher',
        targetType: 'voucher',
        targetId: voucher.code,
        detail: `plan validity ended ${voucher.expiresAt?.toISOString()}`,
      });
    }

    this.logger.log(`Expired ${overdue.length} overdue voucher(s).`);
  }
}
