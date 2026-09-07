import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminJwtPayload } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlockedMacsService } from './blocked-macs.service';
import { BlockMacDto } from './dto/block-mac.dto';

@Controller('admin/blocked-macs')
@UseGuards(JwtAuthGuard)
export class BlockedMacsController {
  constructor(private readonly blockedMacs: BlockedMacsService) {}

  @Get()
  findAll() {
    return this.blockedMacs.findAll();
  }

  @Post()
  block(@Body() dto: BlockMacDto, @Req() req: Request & { user: AdminJwtPayload }) {
    return this.blockedMacs.block(dto.macAddress, dto.reason, req.user.adminId, req.user.email);
  }

  @Delete(':id')
  unblock(@Param('id', ParseIntPipe) id: number, @Req() req: Request & { user: AdminJwtPayload }) {
    return this.blockedMacs.unblock(id, req.user.email, req.user.adminId);
  }
}
