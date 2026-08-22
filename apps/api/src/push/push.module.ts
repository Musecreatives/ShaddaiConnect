import { Global, Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { PushService } from './push.service';

@Global()
@Module({
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
