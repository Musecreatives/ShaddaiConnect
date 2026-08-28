import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { AdminCustomersController } from './admin-customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [EmailModule],
  controllers: [AdminCustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
