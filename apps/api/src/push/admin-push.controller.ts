import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AdminJwtPayload } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscribeAdminPushDto } from './dto/subscribe-admin-push.dto';
import { PushService } from './push.service';

@Controller('admin/push')
@UseGuards(JwtAuthGuard)
export class AdminPushController {
  constructor(private readonly push: PushService) {}

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeAdminPushDto, @Req() req: Request & { user: AdminJwtPayload }) {
    return this.push.subscribeAdmin(dto, req.user.email);
  }
}
