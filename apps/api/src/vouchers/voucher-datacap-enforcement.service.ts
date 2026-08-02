import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Fair-use data cap enforcement. There's no standard RADIUS reply attribute that NAS hardware
 * honors for "kill this session after N bytes" the way Session-Timeout works for time — real
 * throttling-after-cap would need CoA (Change of Authorization, RFC 5176) support configured on
 * pfSense's RADIUS client settings, which isn't confirmed to be set up and is a bigger, separate
 * task. This does a hard cutoff instead (same neutralize-radcheck mechanism as the cumulative
 * time enforcement), which needs no pfSense-side config at all.
 *
 * Dormant by default — `plans.dataCapMb` is null on every plan today, so this only starts
 * expiring vouchers once an admin actually sets a cap via the existing Plans CRUD.
 */
@Injectable()
export class VoucherDataCapEnforcementService {
  private readonly logger = new Logger(VoucherDataCapEnforcementService.name);

  constructor(private readonly prisma: PrismaService) {}

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
      expiredCount++;
    }

    if (expiredCount > 0) {
      this.logger.log(`Expired ${expiredCount} voucher(s) — data cap reached.`);
    }
  }
}
