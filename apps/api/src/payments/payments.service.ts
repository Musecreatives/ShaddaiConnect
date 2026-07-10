import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import type { Payment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaystackService } from './paystack.service';

export interface PaymentStatusResult {
  reference: string;
  status: 'pending' | 'success' | 'failed';
  voucherCode?: string;
  planName?: string;
  expiresAt?: Date | null;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly vouchers: VouchersService,
    private readonly config: ConfigService,
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
    const { authorization_url } = await this.paystack.initializeTransaction({
      email: dto.email,
      amountNaira: Number(plan.priceNaira),
      reference,
      callbackUrl: frontendUrl ? `${frontendUrl}/success?reference=${reference}` : undefined,
    });

    return { authorizationUrl: authorization_url, reference };
  }

  /** Called by the webhook handler once the raw-body HMAC signature has been verified. */
  async handleWebhookEvent(event: { event: string; data: { reference: string } }, rawPayload: string) {
    if (event.event !== 'charge.success') {
      this.logger.log(`Ignoring Paystack event: ${event.event}`);
      return;
    }
    await this.processSuccessfulPayment(event.data.reference, rawPayload);
  }

  async getStatus(reference: string): Promise<PaymentStatusResult> {
    const payment = await this.prisma.payment.findUnique({ where: { paystackReference: reference } });
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
    return this.prisma.$transaction(async (tx) => {
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

      return tx.payment.update({
        where: { id: payment.id },
        data: { voucherId: voucher.id },
      });
    });
  }

  private async toStatusResult(payment: Payment): Promise<PaymentStatusResult> {
    if (payment.status !== 'success' || !payment.voucherId) {
      return { reference: payment.paystackReference, status: payment.status };
    }
    const voucher = await this.prisma.voucher.findUnique({
      where: { id: payment.voucherId },
      include: { plan: true },
    });
    return {
      reference: payment.paystackReference,
      status: payment.status,
      voucherCode: voucher?.code,
      planName: voucher?.plan.name,
      expiresAt: voucher?.expiresAt,
    };
  }
}
