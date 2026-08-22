import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { AdminTrialFeedbackController } from './admin-trial-feedback.controller';
import { TrialController } from './trial.controller';
import { TrialFeedbackRequestService } from './trial-feedback-request.service';
import { TrialFeedbackService } from './trial-feedback.service';
import { TrialService } from './trial.service';
import { TrialVerificationService } from './trial-verification.service';

@Module({
  imports: [VouchersModule, EmailModule],
  controllers: [TrialController, AdminTrialFeedbackController],
  providers: [TrialService, TrialFeedbackService, TrialFeedbackRequestService, TrialVerificationService],
})
export class TrialModule {}
