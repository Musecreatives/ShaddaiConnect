import { Body, Controller, Delete, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SubscribePushDto } from './dto/subscribe-push.dto';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('subscribe')
  subscribe(@Body() dto: SubscribePushDto) {
    return this.push.subscribe(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Delete('subscribe')
  async unsubscribe(@Body('endpoint') endpoint: string) {
    await this.push.unsubscribe(endpoint);
    return { unsubscribed: true };
  }
}
