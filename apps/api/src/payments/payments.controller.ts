import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { FlutterwaveService } from './flutterwave.service';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly flutterwave: FlutterwaveService,
  ) {}

  /** Each call writes a row and calls the Flutterwave API — cheaper to rate-limit than to let
   * someone hammer both. */
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('initialize')
  initialize(@Body() dto: InitializePaymentDto) {
    return this.payments.initialize(dto);
  }

  /** Flutterwave retries webhook deliveries and may legitimately fire several in quick
   * succession — never rate-limit this one. Signature verification is what actually
   * protects it. */
  @SkipThrottle()
  @Post('flutterwave/webhook')
  @HttpCode(200)
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['verif-hash'];
    const rawBody = req.rawBody;
    if (!rawBody || !this.flutterwave.verifyWebhookSignature(signature as string)) {
      throw new UnauthorizedException('Invalid Flutterwave signature');
    }

    // Ack fast; the handler itself is a fast in-process DB transaction (no external calls),
    // so there's no need to defer work past the response here.
    await this.payments.handleWebhookEvent(req.body, rawBody.toString('utf8'));
    return { received: true };
  }

  @Get(':reference/status')
  getStatus(@Param('reference') reference: string) {
    return this.payments.getStatus(reference);
  }
}
