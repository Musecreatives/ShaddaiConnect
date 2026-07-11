import { Module } from '@nestjs/common';
import { AdminCustomersController } from './admin-customers.controller';
import { CustomersService } from './customers.service';

@Module({
  controllers: [AdminCustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
