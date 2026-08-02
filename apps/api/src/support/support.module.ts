import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [EmailModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
