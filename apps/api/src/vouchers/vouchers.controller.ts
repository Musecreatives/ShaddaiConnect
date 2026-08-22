import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PushService } from '../push/push.service';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
export class VouchersController {
  constructor(
    private readonly vouchers: VouchersService,
    private readonly push: PushService,
  ) {}

  /** Public and unauthenticated by design ("check my voucher") — the code alphabet is only
   * ~31^5 ≈ 28.6M combinations, so this is the one place brute-force code guessing is a real
   * risk. A human checking one code doesn't need more than a few tries a minute. */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get(':code/status')
  getStatus(@Param('code') code: string) {
    return this.vouchers.findByCodePublic(code);
  }

  // Same trust model as status above — the code itself is the credential.
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Get(':code/notifications')
  getNotifications(@Param('code') code: string) {
    return this.push.getRecentForVoucher(code);
  }
}
