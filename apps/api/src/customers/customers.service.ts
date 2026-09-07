import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { paymentReminderTemplate } from '../email/templates/payment-reminder.template';
import { trialUpsellTemplate } from '../email/templates/trial-upsell.template';
import { PrismaService } from '../prisma/prisma.service';
import { TRIAL_PLAN_NAME } from '../trial/trial.constants';

export interface AdminCustomerRow {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  voucherCount: number;
  totalPaidNaira: number;
}

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  private get buyUrl(): string {
    return this.config.get<string>('CUSTOMER_APP_URL') || 'https://buy.shaddaicommunications.com';
  }

  async list(limit = 50, offset = 0): Promise<{ customers: AdminCustomerRow[]; total: number }> {
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.customer.count(),
    ]);

    const ids = customers.map((c) => c.id);
    const [voucherCounts, paymentSums] = await Promise.all([
      this.prisma.voucher.groupBy({
        by: ['customerId'],
        _count: { id: true },
        where: { customerId: { in: ids } },
      }),
      this.prisma.payment.groupBy({
        by: ['customerId'],
        _sum: { amountNaira: true },
        where: { customerId: { in: ids }, status: 'success' },
      }),
    ]);

    const voucherCountById = new Map(voucherCounts.map((v) => [v.customerId, v._count.id]));
    const paidById = new Map(
      paymentSums.map((p) => [p.customerId, Number(p._sum.amountNaira ?? 0)]),
    );

    return {
      total,
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        createdAt: c.createdAt,
        voucherCount: voucherCountById.get(c.id) ?? 0,
        totalPaidNaira: paidById.get(c.id) ?? 0,
      })),
    };
  }

  /** Trial-only customers who never bought a paid plan: has a Free Trial voucher, has no
   * voucher on any other plan, has no successful payment, hasn't already gotten the upsell
   * email, and has an email on file. */
  private async trialUpsellCandidateIds(): Promise<number[]> {
    const trialPlan = await this.prisma.plan.findFirst({ where: { name: TRIAL_PLAN_NAME } });
    if (!trialPlan) return [];

    const [trialVoucherCustomers, nonTrialVoucherCustomers, paidCustomers] = await Promise.all([
      this.prisma.voucher.findMany({
        where: { planId: trialPlan.id, customerId: { not: null } },
        select: { customerId: true },
        distinct: ['customerId'],
      }),
      this.prisma.voucher.findMany({
        where: { planId: { not: trialPlan.id }, customerId: { not: null } },
        select: { customerId: true },
        distinct: ['customerId'],
      }),
      this.prisma.payment.findMany({
        where: { status: 'success', customerId: { not: null } },
        select: { customerId: true },
        distinct: ['customerId'],
      }),
    ]);

    const excludeIds = new Set([
      ...nonTrialVoucherCustomers.map((v) => v.customerId!),
      ...paidCustomers.map((p) => p.customerId!),
    ]);
    const trialOnlyIds = trialVoucherCustomers
      .map((v) => v.customerId!)
      .filter((id) => !excludeIds.has(id));
    if (trialOnlyIds.length === 0) return [];

    const eligible = await this.prisma.customer.findMany({
      where: { id: { in: trialOnlyIds }, trialUpsellSentAt: null, email: { not: null } },
      select: { id: true },
    });
    return eligible.map((c) => c.id);
  }

  /** Customers whose most recent (or only) payment attempt failed and who never had a
   * successful one — hasn't already gotten the reminder, has an email on file. */
  private async paymentReminderCandidateIds(): Promise<number[]> {
    const [failedCustomers, paidCustomers] = await Promise.all([
      this.prisma.payment.findMany({
        where: { status: 'failed', customerId: { not: null } },
        select: { customerId: true },
        distinct: ['customerId'],
      }),
      this.prisma.payment.findMany({
        where: { status: 'success', customerId: { not: null } },
        select: { customerId: true },
        distinct: ['customerId'],
      }),
    ]);

    const paidIds = new Set(paidCustomers.map((p) => p.customerId!));
    const failedOnlyIds = failedCustomers
      .map((p) => p.customerId!)
      .filter((id) => !paidIds.has(id));
    if (failedOnlyIds.length === 0) return [];

    const eligible = await this.prisma.customer.findMany({
      where: { id: { in: failedOnlyIds }, paymentReminderSentAt: null, email: { not: null } },
      select: { id: true },
    });
    return eligible.map((c) => c.id);
  }

  async reminderCounts(): Promise<{ trialUpsellPending: number; paymentReminderPending: number }> {
    const [trialUpsell, paymentReminder] = await Promise.all([
      this.trialUpsellCandidateIds(),
      this.paymentReminderCandidateIds(),
    ]);
    return {
      trialUpsellPending: trialUpsell.length,
      paymentReminderPending: paymentReminder.length,
    };
  }

  async notifyTrialUpsell(): Promise<{ notified: number }> {
    const ids = await this.trialUpsellCandidateIds();
    if (ids.length === 0) return { notified: 0 };

    const customers = await this.prisma.customer.findMany({ where: { id: { in: ids } } });
    for (const customer of customers) {
      await this.email.send({
        to: customer.email!,
        subject: 'Ready for more Shaddai WiFi?',
        html: trialUpsellTemplate({ name: customer.name ?? undefined, buyUrl: this.buyUrl }),
      });
    }
    await this.prisma.customer.updateMany({
      where: { id: { in: ids } },
      data: { trialUpsellSentAt: new Date() },
    });
    this.logger.log(`Sent trial-upsell email to ${customers.length} customer(s).`);
    return { notified: customers.length };
  }

  async notifyFailedPayments(): Promise<{ notified: number }> {
    const ids = await this.paymentReminderCandidateIds();
    if (ids.length === 0) return { notified: 0 };

    const customers = await this.prisma.customer.findMany({ where: { id: { in: ids } } });
    for (const customer of customers) {
      await this.email.send({
        to: customer.email!,
        subject: "Your Shaddai WiFi payment didn't go through",
        html: paymentReminderTemplate({ name: customer.name ?? undefined, buyUrl: this.buyUrl }),
      });
    }
    await this.prisma.customer.updateMany({
      where: { id: { in: ids } },
      data: { paymentReminderSentAt: new Date() },
    });
    this.logger.log(`Sent payment-reminder email to ${customers.length} customer(s).`);
    return { notified: customers.length };
  }
}
