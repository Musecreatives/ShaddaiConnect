import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Nothing in the issuance/RADIUS-auth path ever marks a voucher `active` — it's created
 * `unused` and stays that way until this job notices real usage. Polls `radacct` (read-only,
 * per CLAUDE.md — FreeRADIUS owns writes to it) rather than hooking into the auth path directly,
 * since that would mean modifying FreeRADIUS's own config, out of this repo's scope.
 */
@Injectable()
export class VoucherActivationService {
  private readonly logger = new Logger(VoucherActivationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('*/2 * * * *')
  async activateUsedVouchers(): Promise<void> {
    const unused = await this.prisma.voucher.findMany({
      where: { status: 'unused' },
      select: { id: true, code: true },
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

    let activatedCount = 0;
    for (const voucher of unused) {
      if (!firstUseByCode.has(voucher.code)) continue;
      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          status: 'active',
          activatedAt: firstUseByCode.get(voucher.code) ?? new Date(),
        },
      });
      activatedCount++;
    }

    if (activatedCount > 0) {
      this.logger.log(`Activated ${activatedCount} voucher(s) based on real radacct usage.`);
    }
  }
}
