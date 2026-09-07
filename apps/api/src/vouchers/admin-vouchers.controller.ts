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
import { PfsenseService } from '../pfsense/pfsense.service';
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
    private readonly pfsense: PfsenseService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  findAll(@Query() query: QueryVouchersDto) {
    return this.vouchers.findAll({
      status: query.status,
      planId: query.planId,
      ids: query.ids ? query.ids.split(',').map(Number) : undefined,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }

  /** Returns vouchers WITH their plan, matching the shape of GET /admin/vouchers — the admin
   * table renders `voucher.plan.name`, so a bare voucher here crashed the page even though the
   * voucher had been created successfully. Single vs array is preserved so existing callers
   * (and the print flow, which batches) keep working. */
  @Post()
  async create(@Body() dto: CreateVoucherDto) {
    const quantity = dto.quantity ?? 1;
    const opts = { customerId: dto.customerId, amountPaid: dto.amountPaid };
    const issued =
      quantity === 1
        ? [await this.vouchers.issue(dto.planId, opts)]
        : await this.vouchers.issueBatch(dto.planId, quantity, opts);

    const withPlan = await this.vouchers.findWithPlan(issued.map((v) => v.id));
    return quantity === 1 ? withPlan[0] : withPlan;
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

  /** Live disconnect — separate from disable, which only stops the *next* reconnect. Kicks
   * whatever session is open right now for this voucher code, if any. Doesn't change the
   * voucher's status; the caller decides separately whether to also disable it.
   *
   * Goes through pfSense's own captive-portal disconnect, not RADIUS CoA — pfSense never
   * implemented CoA (Redmine #13625), so the old CoaService path always timed out. */
  @Post(':code/disconnect')
  async disconnect(@Param('code') code: string) {
    const result = await this.pfsense.disconnect(code);
    return {
      attempted: this.pfsense.isEnabled,
      success: result.ok && (result.data?.disconnected ?? 0) > 0,
      message: result.message,
    };
  }
}
