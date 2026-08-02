import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactDto } from './dto/contact.dto';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('contact')
  contact(@Body() dto: ContactDto) {
    return this.support.contact(dto);
  }
}
