import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from '../push/push.service';

/** Long enough that someone still on the Flutterwave checkout page isn't nagged mid-payment,
 * short enough that the intent to buy is still fresh. */
const ABANDONED_AFTER_MINUTES = 15;
/** Past this, a nudge reads as spam rather than a helpful reminder — a day-old abandoned
 * checkout is a lost sale, not an in-flight one. */
const GIVE_UP_AFTER_HOURS = 6;

/**
 * Push nudge for checkouts that were started but never paid for: a `payments` row stuck at
 * `pending` while the customer's PWA subscribed against that payment reference at checkout.
 *
 * Deliberately push-only and one-shot. There's no email here because an abandoned checkout may
 * not have a usable email yet, and the existing admin-triggered "Nudge failed payments" already
 * covers payments that actually *failed* — this is the earlier, quieter case where the customer
 * simply never finished.
 */
@Injectable()
export class AbandonedPaymentService {
  private readonly logger = new Logger(AbandonedPaymentService.name);
  /** In-memory, not a DB column: a missed nudge after a restart is harmless, and this avoids a
   * schema change for what is only a "don't repeat myself" guard. Bounded by the 6h window. */
  private readonly nudged = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  @Cron('0 */5 * * * *')
  async nudgeAbandonedCheckouts(): Promise<void> {
    const now = Date.now();
    const olderThan = new Date(now - ABANDONED_AFTER_MINUTES * 60_000);
    const newerThan = new Date(now - GIVE_UP_AFTER_HOURS * 3_600_000);

    const stalled = await this.prisma.payment.findMany({
      where: { status: 'pending', createdAt: { lt: olderThan, gt: newerThan } },
      select: { reference: true, amountNaira: true },
    });
    if (stalled.length === 0) {
      // Keep the dedup set from growing forever once the window is quiet.
      this.nudged.clear();
      return;
    }

    let sent = 0;
    for (const payment of stalled) {
      if (this.nudged.has(payment.reference)) continue;
      this.nudged.add(payment.reference);

      await this.push.sendToPaymentReference(payment.reference, {
        title: 'Finish getting online',
        body: `Your ₦${Number(payment.amountNaira).toLocaleString('en-NG')} purchase wasn't completed. Tap to try again.`,
        tag: 'abandoned-checkout',
      });
      sent++;
    }

    if (sent > 0) {
      this.logger.log(`Nudged ${sent} abandoned checkout(s).`);
    }
  }
}
