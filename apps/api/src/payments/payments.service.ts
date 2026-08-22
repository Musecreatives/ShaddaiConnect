import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import type { Payment } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { voucherTemplate } from '../email/templates/voucher.template';
import { NtfyService } from '../ntfy/ntfy.service';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import { PaystackService } from './paystack.service';

export interface PaymentStatusResult {
  reference: string;
  status: 'pending' | 'success' | 'failed';
  amountNaira: number;
  voucherCode?: string;
  planName?: string;
  expiresAt?: Date | null;
}

export interface AdminPaymentRow {
  id: number;
  reference: string;
  amountNaira: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
  planName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface FraudSignal {
  customerId: number;
  email?: string;
  phone?: string;
  failedCount: number;
  lastAttemptAt: Date;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly vouchers: VouchersService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly ntfy: NtfyService,
  ) {}

  async initialize(dto: InitializePaymentDto) {
    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException(`Plan ${dto.planId} not found`);
    if (!plan.active) throw new BadRequestException(`Plan ${dto.planId} is not active`);

    let customer = await this.prisma.customer.findFirst({ where: { email: dto.email } });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: { email: dto.email, phone: dto.phone },
      });
    }

    const reference = `SHDI-${randomUUID()}`;
    await this.prisma.payment.create({
      data: {
        paystackReference: reference,
        planId: plan.id,
        customerId: customer.id,
        amountNaira: plan.priceNaira,
        status: 'pending',
      },
    });

    const frontendUrl = this.config.get<string>('CUSTOMER_APP_URL');
    // Paystack always appends its own `?reference=...&trxref=...` on redirect — don't add
    // `?reference=` here too, or the customer lands on `/success?reference=X&reference=X`
    // (Next.js parses repeated query keys as an array, breaking the status lookup).
    const { authorization_url } = await this.paystack.initializeTransaction({
      email: dto.email,
      amountNaira: Number(plan.priceNaira),
      reference,
      callbackUrl: frontendUrl ? `${frontendUrl}/success` : undefined,
    });

    return { authorizationUrl: authorization_url, reference };
  }

  /** Called by the webhook handler once the raw-body HMAC signature has been verified. */
  async handleWebhookEvent(
    event: { event: string; data: { reference: string } },
    rawPayload: string,
  ) {
    if (event.event !== 'charge.success') {
      this.logger.log(`Ignoring Paystack event: ${event.event}`);
      return;
    }
    await this.processSuccessfulPayment(event.data.reference, rawPayload);
  }

  async getStatus(reference: string): Promise<PaymentStatusResult> {
    const payment = await this.prisma.payment.findUnique({
      where: { paystackReference: reference },
    });
    if (!payment) throw new NotFoundException(`Payment ${reference} not found`);

    let current = payment;
    if (current.status === 'pending') {
      current = await this.pollPaystackAsFallback(current);
    }

    return this.toStatusResult(current);
  }

  /**
   * Belt-and-braces for the customer success-page poll: if Paystack's webhook hasn't
   * landed yet, actively check with Paystack instead of leaving the customer staring at a
   * "pending" screen. Safe to call repeatedly — processSuccessfulPayment is idempotent.
   */
  private async pollPaystackAsFallback(payment: Payment): Promise<Payment> {
    try {
      const verification = await this.paystack.verifyTransaction(payment.paystackReference);
      if (verification.status === 'success') {
        return this.processSuccessfulPayment(
          payment.paystackReference,
          JSON.stringify(verification),
        );
      }
    } catch (err) {
      this.logger.warn(`Paystack verify fallback failed for ${payment.paystackReference}: ${err}`);
    }
    return payment;
  }

  /**
   * Idempotent on paystack_reference (CLAUDE.md non-negotiable) — Paystack retries webhooks,
   * and the status-poll fallback can race the webhook, so both must be safe to call twice.
   * `updateMany` with `status: 'pending'` in the WHERE clause makes the claim atomic: only one
   * caller ever sees `count === 1` and proceeds to issue a voucher.
   */
  private async processSuccessfulPayment(reference: string, rawPayload: string): Promise<Payment> {
    let issuedVoucherId: number | undefined;

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { paystackReference: reference } });
      if (!payment) throw new NotFoundException(`Payment ${reference} not found`);
      if (payment.status === 'success') return payment;

      const claimed = await tx.payment.updateMany({
        where: { paystackReference: reference, status: 'pending' },
        data: { status: 'success', rawPayload },
      });
      if (claimed.count === 0) {
        // Lost the race to another concurrent call — it already handled issuance.
        return tx.payment.findUniqueOrThrow({ where: { paystackReference: reference } });
      }

      const voucher = await this.vouchers.issueInTx(tx, payment.planId!, {
        customerId: payment.customerId ?? undefined,
        amountPaid: Number(payment.amountNaira),
      });
      issuedVoucherId = voucher.id;

      return tx.payment.update({
        where: { id: payment.id },
        data: { voucherId: voucher.id },
      });
    });

    // Fire-and-forget, post-commit — only on the call that actually won the issuance race,
    // never on a re-delivered webhook or the status-poll fallback hitting the short-circuits above.
    if (issuedVoucherId) {
      this.sendVoucherEmail(result).catch((err) =>
        this.logger.error(`Voucher email dispatch failed for ${reference}: ${err}`),
      );
      this.ntfy.publish({
        title: 'Payment received',
        message: `₦${Number(result.amountNaira).toLocaleString('en-NG')} — ${reference}`,
        tags: ['moneybag'],
      });
    }

    return result;
  }

  private async sendVoucherEmail(payment: Payment): Promise<void> {
    if (!payment.customerId) return;
    const customer = await this.prisma.customer.findUnique({ where: { id: payment.customerId } });
    if (!customer?.email || !payment.voucherId) return;

    const voucher = await this.prisma.voucher.findUnique({
      where: { id: payment.voucherId },
      include: { plan: true },
    });
    if (!voucher) return;

    await this.email.send({
      to: customer.email,
      subject: 'Your Shaddai WiFi voucher',
      html: voucherTemplate({
        code: voucher.code,
        planName: voucher.plan.name,
        expiresAt: voucher.expiresAt,
      }),
    });
  }

  /**
   * Payment has no Prisma relations to Plan/Customer (the live DB has no FK constraints there
   * either — see docs/DECISIONS.md on preserving the schema as introspected), so this joins in
   * application code with two bulk lookups rather than N+1 queries per row.
   */
  async listAdmin(
    filter: QueryPaymentsDto,
  ): Promise<{ payments: AdminPaymentRow[]; total: number }> {
    const where = {
      status: filter.status,
      createdAt:
        filter.from || filter.to
          ? {
              gte: filter.from ? new Date(filter.from) : undefined,
              lte: filter.to ? new Date(filter.to) : undefined,
            }
          : undefined,
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter.limit ?? 50,
        skip: filter.offset ?? 0,
      }),
      this.prisma.payment.count({ where }),
    ]);

    const planIds = [...new Set(payments.map((p) => p.planId).filter((id) => id != null))];
    const customerIds = [...new Set(payments.map((p) => p.customerId).filter((id) => id != null))];

    const [plans, customers] = await Promise.all([
      this.prisma.plan.findMany({ where: { id: { in: planIds } } }),
      this.prisma.customer.findMany({ where: { id: { in: customerIds } } }),
    ]);
    const planById = new Map(plans.map((p) => [p.id, p]));
    const customerById = new Map(customers.map((c) => [c.id, c]));

    return {
      total,
      payments: payments.map((p) => ({
        id: p.id,
        reference: p.paystackReference,
        amountNaira: Number(p.amountNaira),
        status: p.status,
        createdAt: p.createdAt,
        planName: p.planId ? planById.get(p.planId)?.name : undefined,
        customerEmail: p.customerId
          ? (customerById.get(p.customerId)?.email ?? undefined)
          : undefined,
        customerPhone: p.customerId
          ? (customerById.get(p.customerId)?.phone ?? undefined)
          : undefined,
      })),
    };
  }

  /**
   * Simple fraud signal: customers with several failed payments in a short window — no queue,
   * no ML, just a grouped count query against data already being written. Proportionate to this
   * business's actual scale (see .docs/DECISIONS.md — a Kafka/SQS pipeline was considered and
   * explicitly not used here, this business does dozens-to-low-hundreds of purchases a day, not
   * thousands/sec). Surfaced in the admin dashboard as a heads-up, not an automatic block —
   * legitimate customers retry failed cards too; this is a signal for a human to glance at, not
   * an enforcement mechanism.
   */
  async getFraudSignals(windowMinutes = 15, minFailures = 3): Promise<FraudSignal[]> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    const grouped = await this.prisma.payment.groupBy({
      by: ['customerId'],
      where: { status: 'failed', createdAt: { gte: since }, customerId: { not: null } },
      _count: { id: true },
      _max: { createdAt: true },
      having: { id: { _count: { gte: minFailures } } },
    });

    const customerIds = grouped.map((g) => g.customerId).filter((id): id is number => id != null);
    const customers = await this.prisma.customer.findMany({ where: { id: { in: customerIds } } });
    const customerById = new Map(customers.map((c) => [c.id, c]));

    return grouped
      .filter((g) => g.customerId != null)
      .map((g) => ({
        customerId: g.customerId as number,
        email: customerById.get(g.customerId as number)?.email ?? undefined,
        phone: customerById.get(g.customerId as number)?.phone ?? undefined,
        failedCount: g._count.id,
        lastAttemptAt: g._max.createdAt as Date,
      }))
      .sort((a, b) => b.failedCount - a.failedCount);
  }

  private async toStatusResult(payment: Payment): Promise<PaymentStatusResult> {
    const amountNaira = Number(payment.amountNaira);
    if (payment.status !== 'success' || !payment.voucherId) {
      return { reference: payment.paystackReference, status: payment.status, amountNaira };
    }
    const voucher = await this.prisma.voucher.findUnique({
      where: { id: payment.voucherId },
      include: { plan: true },
    });
    return {
      reference: payment.paystackReference,
      status: payment.status,
      amountNaira,
      voucherCode: voucher?.code,
      planName: voucher?.plan.name,
      expiresAt: voucher?.expiresAt,
    };
  }
}
