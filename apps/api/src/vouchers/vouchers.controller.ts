import { Controller, Get, Param } from '@nestjs/common';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchers: VouchersService) {}

  @Get(':code/status')
  getStatus(@Param('code') code: string) {
    return this.vouchers.findByCodePublic(code);
  }
}
