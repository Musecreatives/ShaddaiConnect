import { Controller, Get, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PfsenseService } from './pfsense.service';

/** Read-only. There is intentionally no POST/PATCH here — firewall changes stay in the pfSense
 * web UI (CLAUDE.md Infra boundaries), where they're reviewable and reversible. */
@Controller('admin/firewall')
@UseGuards(JwtAuthGuard)
export class AdminFirewallController {
  constructor(private readonly pfsense: PfsenseService) {}

  @Get()
  async status() {
    const result = await this.pfsense.firewallStatus();
    if (!result.ok || !result.data) {
      throw new ServiceUnavailableException(result.message);
    }
    return result.data;
  }
}
