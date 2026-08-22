import { Global, Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { NtfyController } from './ntfy.controller';
import { NtfyService } from './ntfy.service';

@Global()
@Module({
  imports: [EmailModule],
  controllers: [NtfyController],
  providers: [NtfyService],
  exports: [NtfyService],
})
export class NtfyModule {}
