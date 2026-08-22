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
    const voucher = await this.prisma.voucher.findUnique({ where: { code }, include: { plan: true } });
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
}
