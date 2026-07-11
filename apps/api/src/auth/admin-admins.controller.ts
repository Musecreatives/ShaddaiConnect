import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { PatchAdminDto } from './dto/patch-admin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('admin/admins')
@UseGuards(JwtAuthGuard)
export class AdminAdminsController {
  constructor(private readonly admins: AdminsService) {}

  @Get()
  list() {
    return this.admins.list();
  }

  @Post()
  create(@Body() dto: CreateAdminDto) {
    return this.admins.create(dto);
  }

  @Patch(':id')
  setActive(@Param('id', ParseIntPipe) id: number, @Body() dto: PatchAdminDto) {
    return this.admins.setActive(id, dto.active);
  }
}
