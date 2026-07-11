import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard)
export class AdminStatsController {
  constructor(private readonly stats: StatsService) {}

  @Get()
  getStats() {
    return this.stats.getStats();
  }
}
