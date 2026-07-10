import { Module } from '@nestjs/common';
import { VouchersModule } from '../vouchers/vouchers.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaystackService } from './paystack.service';

@Module({
  imports: [VouchersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackService],
})
export class PaymentsModule {}
