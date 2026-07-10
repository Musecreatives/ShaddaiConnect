import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PatchVoucherDto } from './dto/patch-voucher.dto';
import { QueryVouchersDto } from './dto/query-vouchers.dto';
import { VouchersService } from './vouchers.service';

@Controller('admin/vouchers')
@UseGuards(JwtAuthGuard)
export class AdminVouchersController {
  constructor(private readonly vouchers: VouchersService) {}

  @Get()
  findAll(@Query() query: QueryVouchersDto) {
    return this.vouchers.findAll({
      status: query.status,
      planId: query.planId,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }

  @Post()
  create(@Body() dto: CreateVoucherDto) {
    const quantity = dto.quantity ?? 1;
    const opts = { customerId: dto.customerId, amountPaid: dto.amountPaid };
    return quantity === 1
      ? this.vouchers.issue(dto.planId, opts)
      : this.vouchers.issueBatch(dto.planId, quantity, opts);
  }

  @Patch(':id')
  async patch(@Param('id', ParseIntPipe) id: number, @Body() dto: PatchVoucherDto) {
    switch (dto.action) {
      case 'disable':
        return this.vouchers.disable(id);
      case 'enable':
        return this.vouchers.enable(id);
      case 'extend':
        if (!dto.additionalDays) throw new BadRequestException('additionalDays is required');
        return this.vouchers.extend(id, dto.additionalDays);
    }
  }
}
