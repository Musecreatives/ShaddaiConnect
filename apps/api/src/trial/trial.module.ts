import { Module } from '@nestjs/common';
import { VouchersModule } from '../vouchers/vouchers.module';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';

@Module({
  imports: [VouchersModule],
  controllers: [TrialController],
  providers: [TrialService],
})
export class TrialModule {}
