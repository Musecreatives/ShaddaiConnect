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
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Voucher } from '@prisma/client';
import type { Request } from 'express';
import { AuditService } from '../audit/audit.service';
import { AdminJwtPayload } from '../auth/auth.service';
import { CoaService } from '../coa/coa.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PatchVoucherDto } from './dto/patch-voucher.dto';
import { QueryVouchersDto } from './dto/query-vouchers.dto';
import { VouchersService } from './vouchers.service';

@Controller('admin/vouchers')
@UseGuards(JwtAuthGuard)
export class AdminVouchersController {
  constructor(
    private readonly vouchers: VouchersService,
    private readonly coa: CoaService,
    private readonly audit: AuditService,
  ) {}

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
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PatchVoucherDto,
    @Req() req: Request & { user: AdminJwtPayload },
  ) {
    let result: Voucher;
    let detail: string | undefined;
    switch (dto.action) {
      case 'disable':
        result = await this.vouchers.disable(id);
        break;
      case 'enable':
        result = await this.vouchers.enable(id);
        break;
      case 'extend':
        if (!dto.additionalDays) throw new BadRequestException('additionalDays is required');
        result = await this.vouchers.extend(id, dto.additionalDays);
        detail = `+${dto.additionalDays} day(s)`;
        break;
      default:
        return;
    }

    await this.audit.record({
      adminEmail: req.user.email,
      adminId: req.user.adminId,
      action: `voucher_${dto.action}`,
      targetType: 'voucher',
      targetId: result.code,
      detail,
    });

    return result;
  }

  /** Live disconnect (RADIUS CoA) — separate from disable, which only stops the *next*
   * reconnect. Kicks whatever session is open right now for this voucher code, if any. Doesn't
   * change the voucher's status; the caller decides separately whether to also disable it. */
  @Post(':code/disconnect')
  disconnect(@Param('code') code: string) {
    return this.coa.disconnectVoucher(code);
  }
}
