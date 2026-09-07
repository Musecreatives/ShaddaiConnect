import { Module } from '@nestjs/common';
import { AdminVouchersController } from './admin-vouchers.controller';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { VoucherActivationService } from './voucher-activation.service';
import { VoucherCumulativeEnforcementService } from './voucher-cumulative-enforcement.service';
import { VoucherDataCapEnforcementService } from './voucher-datacap-enforcement.service';
import { VoucherExpiryEnforcementService } from './voucher-expiry-enforcement.service';
import { VoucherExpiryWarningService } from './voucher-expiry-warning.service';

@Module({
  controllers: [VouchersController, AdminVouchersController],
  providers: [
    VouchersService,
    VoucherActivationService,
    VoucherCumulativeEnforcementService,
    VoucherDataCapEnforcementService,
    VoucherExpiryEnforcementService,
    VoucherExpiryWarningService,
  ],
  exports: [VouchersService],
})
export class VouchersModule {}
