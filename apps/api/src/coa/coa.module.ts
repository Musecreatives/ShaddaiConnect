import { Global, Module } from '@nestjs/common';
import { CoaService } from './coa.service';

@Global()
@Module({
  providers: [CoaService],
  exports: [CoaService],
})
export class CoaModule {}
