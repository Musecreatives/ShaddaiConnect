import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  // Hit on every homepage load — global default (100/min) is generous enough for real
  // traffic, but this is a cheap, unauthenticated DB read, worth a dedicated ceiling.
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get('public')
  findPublic() {
    return this.plans.findPublic();
  }
}
