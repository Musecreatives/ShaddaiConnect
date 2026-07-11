import { Module } from '@nestjs/common';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  controllers: [AdminSettingsController],
})
export class SettingsModule {}
