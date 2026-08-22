import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NtfyService } from './ntfy.service';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard)
export class NtfyController {
  constructor(private readonly ntfy: NtfyService) {}

  @Get()
  findRecent() {
    return this.ntfy.getRecent();
  }
}
