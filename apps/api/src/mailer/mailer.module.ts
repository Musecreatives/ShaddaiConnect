import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { AdminMailerController } from './admin-mailer.controller';
import { MailerService } from './mailer.service';

@Module({
  imports: [EmailModule],
  controllers: [AdminMailerController],
  providers: [MailerService],
})
export class MailerModule {}
