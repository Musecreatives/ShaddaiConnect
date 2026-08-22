import { Module } from '@nestjs/common';
import { VouchersModule } from '../vouchers/vouchers.module';
import { BlockedMacsController } from './blocked-macs.controller';
import { BlockedMacsService } from './blocked-macs.service';

@Module({
  imports: [VouchersModule],
  controllers: [BlockedMacsController],
  providers: [BlockedMacsService],
  exports: [BlockedMacsService],
})
export class BlockedMacsModule {}
