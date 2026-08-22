import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard)
export class AdminSettingsController {
  constructor(private readonly config: ConfigService) {}

  /**
   * Read-only, non-secret operational config for the admin Settings page. Never add
   * JWT_SECRET/DATABASE_URL/PAYSTACK_SECRET_KEY/etc. here — this endpoint is reachable by any
   * authenticated admin and is meant purely for "what's currently configured" visibility.
   */
  @Get()
  get() {
    return {
      adminEmail: this.config.get<string>('ADMIN_EMAIL') ?? null,
      radiusInvertOctets: this.config.get('RADIUS_INVERT_OCTETS') === 'true',
      corsOrigins: this.config.get<string>('CORS_ORIGINS')?.split(',') ?? [
        'http://localhost:3001',
        'http://localhost:3002',
      ],
      // Booleans only — never the topic/URL itself, which is the closest thing ntfy has to a
      // shared secret (anyone who knows it can post to or read the admin alert feed).
      ntfyConfigured: Boolean(this.config.get('NTFY_URL') && this.config.get('NTFY_TOPIC')),
      pushConfigured: Boolean(this.config.get('VAPID_PUBLIC_KEY') && this.config.get('VAPID_PRIVATE_KEY')),
    };
  }
}
