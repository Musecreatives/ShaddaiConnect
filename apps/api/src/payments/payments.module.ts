import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { AbandonedPaymentService } from './abandoned-payment.service';
import { AdminPaymentsController } from './admin-payments.controller';
import { FlutterwaveService } from './flutterwave.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [VouchersModule, EmailModule],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [PaymentsService, FlutterwaveService, AbandonedPaymentService],
})
export class PaymentsModule {}
