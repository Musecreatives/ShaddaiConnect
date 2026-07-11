import { Module } from '@nestjs/common';
import { AdminSessionsController } from './admin-sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  controllers: [AdminSessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
