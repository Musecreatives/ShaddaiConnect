import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PfsenseService } from '../pfsense/pfsense.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Fair-use data cap enforcement. No standard RADIUS reply attribute makes a NAS kill a session
 * after N bytes the way Session-Timeout does for time, so this does a hard cutoff: neutralize
 * radcheck (stops the next login) *and* kick the live session via PfsenseService.
 *
 * The live kick matters — without it someone over their cap keeps browsing until their session
 * happens to end, which for a monthly voucher could be days. (The original note here suggested
 * RADIUS CoA for this; that turned out to be a dead end — pfSense's captive portal never
 * implemented it, Redmine #13625 — so we drive pfSense's own disconnect instead.)
 *
 * Dormant until a plan actually has `dataCapMb` set, which is now editable on the admin Plans
 * form.
 */
@Injectable()
export class VoucherDataCapEnforcementService {
  private readonly logger = new Logger(VoucherDataCapEnforcementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pfsense: PfsenseService,
  ) {}

  @Cron('*/2 * * * *')
  async enforceDataCaps(): Promise<void> {
    const activeCapped = await this.prisma.voucher.findMany({
      where: { status: 'active', plan: { dataCapMb: { not: null } } },
      select: { id: true, code: true, plan: { select: { dataCapMb: true } } },
    });
    if (activeCapped.length === 0) return;

    const codes = activeCapped.map((v) => v.code);
    const usage = await this.prisma.radAcct.groupBy({
      by: ['username'],
      where: { username: { in: codes } },
      _sum: { acctInputOctets: true, acctOutputOctets: true },
    });
    const usedBytesByCode = new Map(
      usage.map((u) => [
        u.username,
        Number(u._sum.acctInputOctets ?? 0) + Number(u._sum.acctOutputOctets ?? 0),
      ]),
    );

    let expiredCount = 0;
    for (const voucher of activeCapped) {
      const capBytes = Number(voucher.plan.dataCapMb) * 1_000_000;
      const usedBytes = usedBytesByCode.get(voucher.code) ?? 0;
      if (usedBytes < capBytes) continue;

      await this.prisma.$transaction(async (tx) => {
        await tx.radCheck.deleteMany({ where: { username: voucher.code } });
        await tx.voucher.update({ where: { id: voucher.id }, data: { status: 'expired' } });
      });
      const kick = await this.pfsense.disconnect(voucher.code);
      this.logger.log(
        `${voucher.code} hit its ${voucher.plan.dataCapMb}MB cap (${Math.round(usedBytes / 1_000_000)}MB used). ${kick.message}`,
      );
      expiredCount++;
    }

    if (expiredCount > 0) {
      this.logger.log(`Expired ${expiredCount} voucher(s) — data cap reached.`);
    }
  }
}
