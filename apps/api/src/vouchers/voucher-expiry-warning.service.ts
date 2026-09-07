import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';

const HOURLY_WARNING_WINDOW_SECONDS = 5 * 60;
const MONTHLY_WARNING_WINDOW_HOURS = 24;

/**
 * Pushes a "your time is almost up" alert once per voucher — hourly plans (trial included) get
 * it in the last 5 minutes of their RADIUS Session-Timeout; monthly (paid subscription) plans
 * get it in the last 24 hours before vouchers.expiresAt. `warned` is in-memory (not persisted):
 * a restart mid-window means a customer might get a duplicate warning at worst, never a missed
 * one, which is the safe direction for a nice-to-have alert like this.
 */
@Injectable()
export class VoucherExpiryWarningService {
  private readonly logger = new Logger(VoucherExpiryWarningService.name);
  private readonly warned = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  @Cron('*/30 * * * * *')
  async warnExpiringVouchers(): Promise<void> {
    await this.warnHourlyVouchers();
    await this.warnMonthlyVouchers();
  }

  private async warnHourlyVouchers(): Promise<void> {
    const activeHourly = await this.prisma.voucher.findMany({
      where: { status: 'active', activatedAt: { not: null }, plan: { planType: 'hourly' } },
      select: { code: true, activatedAt: true },
    });
    if (activeHourly.length === 0) return;

    const codes = activeHourly.map((v) => v.code);
    const sessionTimeouts = await this.prisma.radReply.findMany({
      where: { username: { in: codes }, attribute: 'Session-Timeout' },
      select: { username: true, value: true },
    });
    const timeoutByCode = new Map(sessionTimeouts.map((r) => [r.username, Number(r.value)]));

    const now = Date.now();
    for (const voucher of activeHourly) {
      const key = `hourly:${voucher.code}`;
      if (this.warned.has(key)) continue;
      const timeoutSeconds = timeoutByCode.get(voucher.code);
      if (!timeoutSeconds || !voucher.activatedAt) continue;

      const remainingSeconds = (voucher.activatedAt.getTime() + timeoutSeconds * 1000 - now) / 1000;
      if (remainingSeconds <= 0 || remainingSeconds > HOURLY_WARNING_WINDOW_SECONDS) continue;

      this.warned.add(key);
      this.push.sendToVoucher(voucher.code, {
        title: 'Your session is almost up',
        body: `Less than ${Math.ceil(remainingSeconds / 60)} minutes left — buy a plan to stay online.`,
        tag: 'expiring',
      });
      this.logger.log(`Sent expiry warning for ${voucher.code}`);
    }
  }

  /** Paid monthly-plan vouchers (real subscriptions) — much longer warning horizon than the
   * live session timer, since "expires in 3 weeks" isn't useful until it's closer. */
  private async warnMonthlyVouchers(): Promise<void> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + MONTHLY_WARNING_WINDOW_HOURS * 60 * 60 * 1000);

    const expiringSoon = await this.prisma.voucher.findMany({
      where: {
        status: 'active',
        plan: { planType: 'monthly' },
        expiresAt: { gt: now, lte: windowEnd },
      },
      select: { code: true, expiresAt: true },
    });

    for (const voucher of expiringSoon) {
      const key = `monthly:${voucher.code}`;
      if (this.warned.has(key) || !voucher.expiresAt) continue;

      const remainingHours = Math.ceil(
        (voucher.expiresAt.getTime() - now.getTime()) / (60 * 60 * 1000),
      );
      this.warned.add(key);
      this.push.sendToVoucher(voucher.code, {
        title: 'Your plan expires soon',
        body:
          remainingHours <= 1
            ? 'Less than an hour left — renew to stay online.'
            : `${remainingHours} hours left — renew to stay online.`,
        tag: 'expiring',
      });
      this.logger.log(`Sent monthly expiry warning for ${voucher.code}`);
    }
  }
}
