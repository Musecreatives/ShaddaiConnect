import { Module } from '@nestjs/common';
import { AdminNetworkController } from './admin-network.controller';
import { CambiumSnmpService } from './cambium-snmp.service';
import { NetworkService } from './network.service';
import { OmadaClientService } from './omada-client.service';

@Module({
  controllers: [AdminNetworkController],
  providers: [NetworkService, OmadaClientService, CambiumSnmpService],
  exports: [OmadaClientService],
})
export class NetworkModule {}
