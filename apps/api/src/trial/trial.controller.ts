import { Body, Controller, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RequestTrialCodeDto } from './dto/request-trial-code.dto';
import { SubmitTrialFeedbackDto } from './dto/submit-trial-feedback.dto';
import { VerifyTrialCodeDto } from './dto/verify-trial-code.dto';
import { TrialFeedbackService } from './trial-feedback.service';
import { TrialVerificationService } from './trial-verification.service';

@Controller('trial')
export class TrialController {
  constructor(
    private readonly verification: TrialVerificationService,
    private readonly feedback: TrialFeedbackService,
  ) {}

  // The old unverified POST /trial (phone+email only, no domain/code check) was removed
  // 2026-08-07 — it was a live bypass of every anti-abuse control added to request-code/
  // verify-code, and was actively being used to route around the MAC-reuse guard.

  // Public and unauthenticated by design (no payment involved) — rate-limited for the same
  // reason as /vouchers/:code/status and /payments/initialize (see .docs/DECISIONS.md security
  // hardening pass): cheap to hammer otherwise, and this sends a real email per call.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('request-code')
  requestCode(@Body() dto: RequestTrialCodeDto) {
    return this.verification.requestCode(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-code')
  verifyCode(@Body() dto: VerifyTrialCodeDto) {
    return this.verification.verifyAndClaim(dto.email, dto.code);
  }

  // Public and unauthenticated — the link is emailed directly to the trial customer, same trust
  // model as the voucher code itself.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('feedback/:code')
  submitFeedback(@Param('code') code: string, @Body() dto: SubmitTrialFeedbackDto) {
    return this.feedback.submit(code, dto);
  }
}
