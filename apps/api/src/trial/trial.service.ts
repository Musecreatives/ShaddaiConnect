import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { NtfyService } from '../ntfy/ntfy.service';
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
    private readonly ntfy: NtfyService,
  ) {}

  async claim(
    phone: string,
    email: string,
    fullName?: string,
    locationNote?: string,
  ): Promise<{ code: string }> {
    const plan = await this.prisma.plan.findFirst({ where: { name: TRIAL_PLAN_NAME } });
    if (!plan) {
      throw new NotFoundException(
        'Free trial is not set up yet — create a plan named "Free Trial" in the admin Plans page.',
      );
    }

    // Matches on phone OR email — either one having already claimed is enough to block a repeat,
    // so switching one field doesn't get you a second trial.
    let customer = await this.prisma.customer.findFirst({ where: { OR: [{ phone }, { email }] } });
    if (!customer) {
      customer = await this.prisma.customer.create({
        data: { phone, email, name: fullName, locationNote },
      });
    } else {
      const alreadyClaimed = await this.prisma.voucher.count({
        where: { planId: plan.id, customerId: customer.id },
      });
      if (alreadyClaimed > 0) {
        throw new ConflictException('This phone number or email has already claimed a free trial.');
      }
      // Backfill whichever fields were missing (e.g. an existing waitlist/customer row with only
      // a phone) so future dedup checks and notifications have both.
      customer = await this.prisma.customer.update({
        where: { id: customer.id },
        data: {
          email: customer.email ?? email,
          phone: customer.phone ?? phone,
          name: customer.name ?? fullName,
          locationNote: customer.locationNote ?? locationNote,
        },
      });
    }

    const voucher = await this.vouchers.issue(plan.id, {
      customerId: customer.id,
      amountPaid: 0,
      sessionTimeoutSecondsOverride: TRIAL_SESSION_SECONDS,
    });

    this.ntfy.publish({
      title: 'New free trial signup',
      message: `${voucher.code} registered for a free trial`,
      tags: ['bust_in_silhouette'],
    });

    return { code: voucher.code };
  }
}
