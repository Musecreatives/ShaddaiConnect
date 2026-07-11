import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { StatsService } from './stats.service';

@Module({
  controllers: [AdminStatsController],
  providers: [StatsService],
})
export class StatsModule {}
