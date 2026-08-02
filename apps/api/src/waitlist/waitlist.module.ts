import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { AdminWaitlistController } from './admin-waitlist.controller';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [EmailModule],
  controllers: [WaitlistController, AdminWaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}
