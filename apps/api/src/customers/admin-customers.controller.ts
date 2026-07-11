import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { QueryCustomersDto } from './dto/query-customers.dto';

@Controller('admin/customers')
@UseGuards(JwtAuthGuard)
export class AdminCustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@Query() query: QueryCustomersDto) {
    return this.customers.list(query.limit, query.offset);
  }
}
