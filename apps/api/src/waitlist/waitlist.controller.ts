import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  // Public and unauthenticated by design, same rate-limit rationale as /trial.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  join(@Body() dto: JoinWaitlistDto) {
    return this.waitlist.join(dto);
  }
}
