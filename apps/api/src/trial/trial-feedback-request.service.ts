import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';
import { trialFeedbackTemplate } from '../email/templates/trial-feedback.template';
import { PrismaService } from '../prisma/prisma.service';
import { TRIAL_PLAN_NAME } from './trial.constants';

const GIVE_UP_AFTER_MS = 24 * 60 * 60 * 1000; // never connected at all -- stop waiting after a day
const ASK_AFTER_MS = 40 * 60 * 1000; // claimed 40+ min ago -- their 20-minute session has had time to run its course

/**
 * Sends a "how was your trial" feedback request once per trial voucher, after the customer has
 * actually had a chance to use it -- not immediately on claim. Two ways a trial counts as "done":
 * VoucherCumulativeEnforcementService already expired it (they used the full 20 minutes), or
 * enough wall-clock time has passed since claiming that they've clearly had their shot even if
 * they disconnected early. Never emails someone who claimed a trial and never actually connected
 * (radacct has no row for their code) -- asking for feedback on an experience they didn't have
 * would be a strange purchase-intent-tracking email to accidentally send.
 */
@Injectable()
export class TrialFeedbackRequestService {
  private readonly logger = new Logger(TrialFeedbackRequestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  @Cron('*/10 * * * *')
  async requestFeedback(): Promise<void> {
    const plan = await this.prisma.plan.findFirst({ where: { name: TRIAL_PLAN_NAME } });
    if (!plan) return;

    const askCutoff = new Date(Date.now() - ASK_AFTER_MS);
    const candidates = await this.prisma.voucher.findMany({
      where: {
        planId: plan.id,
        feedbackRequestedAt: null,
        customerId: { not: null },
        OR: [{ status: 'expired' }, { createdAt: { lt: askCutoff } }],
      },
    });
    if (candidates.length === 0) return;

    const customerIds = [...new Set(candidates.map((v) => v.customerId!))];
    const customers = await this.prisma.customer.findMany({ where: { id: { in: customerIds } } });
    const customerById = new Map(customers.map((c) => [c.id, c]));

    const feedbackBaseUrl = this.config.get<string>('CUSTOMER_APP_URL') || 'https://buy.shaddaicommunications.com';
    const giveUpCutoff = new Date(Date.now() - GIVE_UP_AFTER_MS);

    let sent = 0;
    for (const voucher of candidates) {
      const customer = customerById.get(voucher.customerId!);

      const connected = await this.prisma.radAcct.findFirst({
        where: { username: voucher.code },
        select: { radAcctId: true },
      });

      if (!connected) {
        // Give up waiting after a day so this query doesn't keep re-scanning the same
        // never-used voucher forever.
        if (voucher.createdAt < giveUpCutoff) {
          await this.prisma.voucher.update({
            where: { id: voucher.id },
            data: { feedbackRequestedAt: new Date() },
          });
        }
        continue;
      }

      if (!customer?.email) {
        await this.prisma.voucher.update({
          where: { id: voucher.id },
          data: { feedbackRequestedAt: new Date() },
        });
        continue;
      }

      await this.email.send({
        to: customer.email,
        subject: 'How was your free trial?',
        html: trialFeedbackTemplate({
          name: customer.name ?? undefined,
          feedbackUrl: `${feedbackBaseUrl}/trial/feedback/${voucher.code}`,
        }),
      });
      await this.prisma.voucher.update({
        where: { id: voucher.id },
        data: { feedbackRequestedAt: new Date() },
      });
      sent++;
    }

    if (sent > 0) {
      this.logger.log(`Sent trial feedback request to ${sent} customer(s).`);
    }
  }
}
