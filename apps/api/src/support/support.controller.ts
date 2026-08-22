import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactDto } from './dto/contact.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
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

@Controller('admin/support-tickets')
@UseGuards(JwtAuthGuard)
export class AdminSupportController {
  constructor(private readonly support: SupportService) {}

  @Get()
  findAll() {
    return this.support.findAllForAdmin();
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTicketDto) {
    return this.support.updateForAdmin(id, dto);
  }
}
