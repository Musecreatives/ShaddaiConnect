import { Module } from '@nestjs/common';
import { AdminVouchersController } from './admin-vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  controllers: [AdminVouchersController],
  providers: [VouchersService],
  exports: [VouchersService],
})
export class VouchersModule {}
