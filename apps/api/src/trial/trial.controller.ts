import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ClaimTrialDto } from './dto/claim-trial.dto';
import { TrialService } from './trial.service';

@Controller('trial')
export class TrialController {
  constructor(private readonly trial: TrialService) {}

  // Public and unauthenticated by design (no payment involved) — rate-limited for the same
  // reason as /vouchers/:code/status and /payments/initialize (see .docs/DECISIONS.md security
  // hardening pass): cheap to hammer otherwise, and each call writes DB + RADIUS rows.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  claim(@Body() dto: ClaimTrialDto) {
    return this.trial.claim(dto.phone);
  }
}
