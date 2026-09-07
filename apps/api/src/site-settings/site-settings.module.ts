import { Module } from '@nestjs/common';
import {
  AdminSiteSettingsController,
  PublicSiteSettingsController,
} from './site-settings.controller';
import { SiteSettingsService } from './site-settings.service';

@Module({
  controllers: [PublicSiteSettingsController, AdminSiteSettingsController],
  providers: [SiteSettingsService],
  exports: [SiteSettingsService],
})
export class SiteSettingsModule {}
