import { Module } from '@nestjs/common';
import { AdminNetworkController } from './admin-network.controller';
import { NetworkService } from './network.service';

@Module({
  controllers: [AdminNetworkController],
  providers: [NetworkService],
})
export class NetworkModule {}
