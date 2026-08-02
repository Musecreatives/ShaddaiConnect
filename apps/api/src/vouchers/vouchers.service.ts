import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Voucher } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { formatRadiusExpiration } from './radius-date.util';
import { generateVoucherCode } from './voucher-code.util';

export type Tx = Prisma.TransactionClient;

export interface IssueVoucherOptions {
  customerId?: number;
  amountPaid?: number;
  simultaneousUseOverride?: number;
  /** Overrides the plan's durationHours*3600 RADIUS Session-Timeout — needed for the free trial
   * (20 minutes doesn't fit the whole-hours durationHours column) without a schema change. */
  sessionTimeoutSecondsOverride?: number;
}

export interface VoucherFilter {
  status?: 'unused' | 'active' | 'expired' | 'disabled';
  planId?: number;
  from?: Date;
  to?: Date;
}

const MAX_CODE_ATTEMPTS = 15;

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * THE core operation (CLAUDE.md "core invariant"): a voucher is usable ONLY when its
   * RADIUS rows exist. Runs in one transaction — rollback-all on failure, never leave a
   * vouchers row without matching radcheck rows or vice versa.
   *
   * Callers that need the voucher issued atomically alongside their own writes (e.g. the
   * Paystack webhook marking a payment successful) should use `issueInTx` with their own
   * transaction client instead — Prisma's interactive transactions each hold a dedicated
   * connection, so calling `issue()` (which opens its own `$transaction`) from inside
   * another transaction would run on a second connection and not actually be atomic with it.
   */
  async issue(planId: number, opts: IssueVoucherOptions = {}): Promise<Voucher> {
    return this.prisma.$transaction((tx) => this.issueInTx(tx, planId, opts));
  }

  async issueInTx(tx: Tx, planId: number, opts: IssueVoucherOptions = {}): Promise<Voucher> {
    const plan = await tx.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`Plan ${planId} not found`);
    if (!plan.active) throw new BadRequestException(`Plan ${planId} is not active`);

    const code = await this.generateUniqueCode(tx);
    const simultaneousUse = opts.simultaneousUseOverride ?? plan.simultaneousUse;

    let expiresAt: Date | null = null;
    if (plan.planType === 'monthly') {
      const validityDays = plan.validityDays ?? 30;
      expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);
    }

    const voucher = await tx.voucher.create({
      data: {
        code,
        planId: plan.id,
        customerId: opts.customerId,
        status: 'unused',
        simultaneousUseOverride: opts.simultaneousUseOverride,
        amountPaid: opts.amountPaid,
        expiresAt,
      },
    });

    await tx.radCheck.create({
      data: { username: code, attribute: 'Cleartext-Password', op: ':=', value: code },
    });
    await tx.radCheck.create({
      data: {
        username: code,
        attribute: 'Simultaneous-Use',
        op: ':=',
        value: String(simultaneousUse),
      },
    });

    if (plan.planType === 'monthly' && expiresAt) {
      await tx.radCheck.create({
        data: {
          username: code,
          attribute: 'Expiration',
          op: ':=',
          value: formatRadiusExpiration(expiresAt),
        },
      });
    }

    if (plan.planType === 'hourly' && plan.durationHours) {
      const seconds = opts.sessionTimeoutSecondsOverride ?? plan.durationHours * 3600;
      await tx.radReply.create({
        data: {
          username: code,
          attribute: 'Session-Timeout',
          op: ':=',
          value: String(seconds),
        },
      });
    }

    if (plan.bandwidthDownKbps) {
      await tx.radReply.create({
        data: {
          username: code,
          attribute: 'WISPr-Bandwidth-Max-Down',
          op: ':=',
          value: String(plan.bandwidthDownKbps * 1000),
        },
      });
    }
    if (plan.bandwidthUpKbps) {
      await tx.radReply.create({
        data: {
          username: code,
          attribute: 'WISPr-Bandwidth-Max-Up',
          op: ':=',
          value: String(plan.bandwidthUpKbps * 1000),
        },
      });
    }

    return voucher;
  }

  async issueBatch(planId: number, quantity: number, opts: IssueVoucherOptions = {}): Promise<Voucher[]> {
    const vouchers: Voucher[] = [];
    for (let i = 0; i < quantity; i++) {
      vouchers.push(await this.issue(planId, opts));
    }
    return vouchers;
  }

  async findAll(filter: VoucherFilter = {}) {
    return this.prisma.voucher.findMany({
      where: {
        status: filter.status,
        planId: filter.planId,
        createdAt:
          filter.from || filter.to
            ? { gte: filter.from, lte: filter.to }
            : undefined,
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(id: number): Promise<Voucher> {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) throw new NotFoundException(`Voucher ${id} not found`);
    return voucher;
  }

  /**
   * Public "check my voucher" lookup — deliberately returns only what a customer needs to see,
   * never RADIUS internals (CLAUDE.md: "Never expose internals in customer-facing text").
   */
  async findByCodePublic(code: string) {
    const voucher = await this.prisma.voucher.findUnique({ where: { code }, include: { plan: true } });
    if (!voucher) throw new NotFoundException('Voucher not found');

    // Read-only check for the captive portal's pre-flight validation (before it even attempts
    // RADIUS auth) — an open radacct row (acctStopTime null) means this code is currently
    // connected somewhere; combined with Simultaneous-Use=1 that's why a second login would fail.
    const openSession = await this.prisma.radAcct.findFirst({
      where: { username: code, acctStopTime: null },
      select: { radAcctId: true },
    });

    return {
      code: voucher.code,
      status: voucher.status,
      planName: voucher.plan.name,
      expiresAt: voucher.expiresAt,
      connectedElsewhere: !!openSession,
    };
  }

  /** Neutralizes radcheck rows so the code can no longer authenticate, and marks disabled. */
  async disable(id: number): Promise<Voucher> {
    const voucher = await this.findOneOrThrow(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.radCheck.deleteMany({ where: { username: voucher.code } });
      return tx.voucher.update({ where: { id }, data: { status: 'disabled' } });
    });
  }

  /** Re-creates the radcheck rows a disabled voucher needs to authenticate again. */
  async enable(id: number): Promise<Voucher> {
    const voucher = await this.findOneOrThrow(id);
    if (voucher.status !== 'disabled') {
      throw new BadRequestException(`Voucher ${id} is not disabled`);
    }
    const plan = await this.prisma.plan.findUniqueOrThrow({ where: { id: voucher.planId } });
    const simultaneousUse = voucher.simultaneousUseOverride ?? plan.simultaneousUse;

    return this.prisma.$transaction(async (tx) => {
      await tx.radCheck.deleteMany({ where: { username: voucher.code } });

      await tx.radCheck.create({
        data: {
          username: voucher.code,
          attribute: 'Cleartext-Password',
          op: ':=',
          value: voucher.code,
        },
      });
      await tx.radCheck.create({
        data: {
          username: voucher.code,
          attribute: 'Simultaneous-Use',
          op: ':=',
          value: String(simultaneousUse),
        },
      });

      if (plan.planType === 'monthly' && voucher.expiresAt) {
        await tx.radCheck.create({
          data: {
            username: voucher.code,
            attribute: 'Expiration',
            op: ':=',
            value: formatRadiusExpiration(voucher.expiresAt),
          },
        });
      }

      return tx.voucher.update({
        where: { id },
        data: { status: voucher.activatedAt ? 'active' : 'unused' },
      });
    });
  }

  /** Monthly: pushes out validity (radcheck Expiration + vouchers.expiresAt). */
  async extend(id: number, additionalDays: number): Promise<Voucher> {
    if (additionalDays <= 0) throw new BadRequestException('additionalDays must be positive');
    const voucher = await this.findOneOrThrow(id);
    const plan = await this.prisma.plan.findUniqueOrThrow({ where: { id: voucher.planId } });
    if (plan.planType !== 'monthly') {
      throw new BadRequestException('extend() only applies to monthly plans');
    }

    const base = voucher.expiresAt && voucher.expiresAt > new Date() ? voucher.expiresAt : new Date();
    const newExpiresAt = new Date(base.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.radCheck.findFirst({
        where: { username: voucher.code, attribute: 'Expiration' },
      });
      if (existing) {
        await tx.radCheck.update({
          where: { id: existing.id },
          data: { value: formatRadiusExpiration(newExpiresAt) },
        });
      } else {
        await tx.radCheck.create({
          data: {
            username: voucher.code,
            attribute: 'Expiration',
            op: ':=',
            value: formatRadiusExpiration(newExpiresAt),
          },
        });
      }

      return tx.voucher.update({ where: { id }, data: { expiresAt: newExpiresAt } });
    });
  }

  private async generateUniqueCode(tx: Tx): Promise<string> {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = generateVoucherCode();
      const existing = await tx.voucher.findUnique({ where: { code } });
      if (!existing) return code;
    }
    throw new ConflictException('Could not generate a unique voucher code, retry');
  }
}
