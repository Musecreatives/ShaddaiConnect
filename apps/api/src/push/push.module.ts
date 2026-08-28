import { Global, Module } from '@nestjs/common';
import { AdminPushController } from './admin-push.controller';
import { PushController } from './push.controller';
import { PushService } from './push.service';

@Global()
@Module({
  controllers: [PushController, AdminPushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
