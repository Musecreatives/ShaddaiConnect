import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { TRIAL_PLAN_NAME } from './trial.constants';

// The trial plan is looked up by name rather than a hardcoded ID — plan IDs differ between
// environments (dev DB vs the live server), and this avoids needing an env var just for one ID.
// Create it via the admin Plans page: name exactly "Free Trial", priceNaira 0, planType hourly,
// active TRUE (VouchersService.issueInTx refuses to issue against an inactive plan — that check
// exists to stop issuing against a discontinued plan, and would block trial claims too). Hidden
// from the public buy-site list instead via PlansService.findPublic()'s name-based exclusion, not
// via `active: false`. durationHours can be anything truthy (e.g. 1) for display purposes; the
// actual RADIUS session length is fixed below, independent of that column.
const TRIAL_SESSION_SECONDS = 20 * 60;

@Injectable()
export class TrialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchers: VouchersService,
  ) {}

  async claim(phone: string): Promise<{ code: string }> {
    const plan = await this.prisma.plan.findFirst({ where: { name: TRIAL_PLAN_NAME } });
    if (!plan) {
      throw new NotFoundException(
        'Free trial is not set up yet — create a plan named "Free Trial" in the admin Plans page.',
      );
    }

    let customer = await this.prisma.customer.findFirst({ where: { phone } });
    if (!customer) {
      customer = await this.prisma.customer.create({ data: { phone } });
    } else {
      const alreadyClaimed = await this.prisma.voucher.count({
        where: { planId: plan.id, customerId: customer.id },
      });
      if (alreadyClaimed > 0) {
        throw new ConflictException('This phone number has already claimed a free trial.');
      }
    }

    const voucher = await this.vouchers.issue(plan.id, {
      customerId: customer.id,
      amountPaid: 0,
      sessionTimeoutSecondsOverride: TRIAL_SESSION_SECONDS,
    });

    return { code: voucher.code };
  }
}
