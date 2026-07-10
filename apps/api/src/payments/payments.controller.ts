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
import type { Request } from 'express';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentsService } from './payments.service';
import { PaystackService } from './paystack.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly paystack: PaystackService,
  ) {}

  @Post('initialize')
  initialize(@Body() dto: InitializePaymentDto) {
    return this.payments.initialize(dto);
  }

  @Post('paystack/webhook')
  @HttpCode(200)
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['x-paystack-signature'];
    const rawBody = req.rawBody;
    if (!rawBody || !this.paystack.verifyWebhookSignature(rawBody, signature as string)) {
      throw new UnauthorizedException('Invalid Paystack signature');
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
