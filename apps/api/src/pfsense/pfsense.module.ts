import { Global, Module } from '@nestjs/common';
import { AdminFirewallController } from './admin-firewall.controller';
import { PfsenseService } from './pfsense.service';

/** Global like PrismaModule/CoaModule — the disconnect + MAC-block capability is needed from
 * several unrelated domains (vouchers, blocked-macs, sessions) and carries no per-module state. */
@Global()
@Module({
  controllers: [AdminFirewallController],
  providers: [PfsenseService],
  exports: [PfsenseService],
})
export class PfsenseModule {}
