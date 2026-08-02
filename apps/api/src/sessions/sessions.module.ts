import { Module } from '@nestjs/common';
import { NetworkModule } from '../network/network.module';
import { AdminSessionsController } from './admin-sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [NetworkModule],
  controllers: [AdminSessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
