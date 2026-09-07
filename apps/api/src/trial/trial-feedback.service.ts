import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitTrialFeedbackDto } from './dto/submit-trial-feedback.dto';
import { TRIAL_PLAN_NAME } from './trial.constants';

@Injectable()
export class TrialFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  /** Looked up by voucher code (not id) since that's what's in the emailed link and what the
   * customer can actually read off their ticket — same pattern as the public voucher status
   * lookup. Only trial-plan vouchers are valid targets; a real paid voucher submitting here would
   * be a mistake, not a legitimate feedback flow. */
  async submit(code: string, dto: SubmitTrialFeedbackDto): Promise<{ submitted: true }> {
    const voucher = await this.prisma.voucher.findUnique({
      where: { code },
      include: { plan: true },
    });
    if (!voucher || voucher.plan.name !== TRIAL_PLAN_NAME) {
      throw new NotFoundException('Trial voucher not found');
    }
    if (!dto.signalQuality && !dto.wouldBuy && !dto.locationNote && !dto.comments) {
      throw new BadRequestException('Provide at least one answer');
    }

    await this.prisma.trialFeedback.create({
      data: {
        voucherId: voucher.id,
        signalQuality: dto.signalQuality,
        wouldBuy: dto.wouldBuy,
        locationNote: dto.locationNote,
        comments: dto.comments,
      },
    });

    return { submitted: true };
  }

  /** Admin list, joined with the voucher's code in app code (same no-FK-relations pattern as
   * PaymentsService/CustomersService) since business tables in this schema don't carry Prisma
   * relations to each other. */
  async findAllForAdmin() {
    const feedback = await this.prisma.trialFeedback.findMany({ orderBy: { createdAt: 'desc' } });
    if (feedback.length === 0) return [];

    const voucherIds = [...new Set(feedback.map((f) => f.voucherId))];
    const vouchers = await this.prisma.voucher.findMany({ where: { id: { in: voucherIds } } });
    const voucherById = new Map(vouchers.map((v) => [v.id, v]));

    return feedback.map((f) => ({
      id: f.id,
      voucherCode: voucherById.get(f.voucherId)?.code ?? null,
      signalQuality: f.signalQuality,
      wouldBuy: f.wouldBuy,
      locationNote: f.locationNote,
      comments: f.comments,
      createdAt: f.createdAt,
    }));
  }

  /**
   * Devices (MACs) that have shown up on more than one Free Trial voucher — pure analytics view
   * for admin review (CLAUDE.md: devices table is analytics only, never enforcement; this reads
   * it, it doesn't act on it — VoucherActivationService.blockRepeatTrialDevices is the one place
   * that actually blocks on this signal). Sourced from `devices`, written by
   * VoucherActivationService.recordDeviceSightings on every trial activation.
   */
  async findRepeatTrialDevices() {
    const trialPlan = await this.prisma.plan.findFirst({ where: { name: TRIAL_PLAN_NAME } });
    if (!trialPlan) return [];

    const trialVouchers = await this.prisma.voucher.findMany({
      where: { planId: trialPlan.id },
      select: { id: true, code: true, customerId: true },
    });
    if (trialVouchers.length === 0) return [];
    const voucherById = new Map(trialVouchers.map((v) => [v.id, v]));

    const devices = await this.prisma.device.findMany({
      where: { voucherId: { in: trialVouchers.map((v) => v.id) } },
      orderBy: { firstSeen: 'asc' },
    });
    if (devices.length === 0) return [];

    const customerIds = [
      ...new Set(trialVouchers.map((v) => v.customerId).filter((id): id is number => id != null)),
    ];
    const customers = await this.prisma.customer.findMany({ where: { id: { in: customerIds } } });
    const customerById = new Map(customers.map((c) => [c.id, c]));

    const byMac = new Map<
      string,
      {
        voucherCode: string;
        firstSeen: Date;
        customer: { name: string | null; phone: string | null; email: string | null } | null;
      }[]
    >();
    for (const device of devices) {
      const voucher = voucherById.get(device.voucherId);
      if (!voucher) continue;
      const customer = voucher.customerId ? (customerById.get(voucher.customerId) ?? null) : null;
      const entry = {
        voucherCode: voucher.code,
        firstSeen: device.firstSeen,
        customer: customer
          ? { name: customer.name, phone: customer.phone, email: customer.email }
          : null,
      };
      const list = byMac.get(device.macAddress);
      if (list) list.push(entry);
      else byMac.set(device.macAddress, [entry]);
    }

    return [...byMac.entries()]
      .map(([macAddress, usages]) => ({ macAddress, usageCount: usages.length, usages }))
      .filter((row) => row.usageCount > 1)
      .sort((a, b) => b.usageCount - a.usageCount);
  }
}
