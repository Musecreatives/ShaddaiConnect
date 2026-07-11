import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NetworkService } from './network.service';

@Controller('admin/network')
@UseGuards(JwtAuthGuard)
export class AdminNetworkController {
  constructor(private readonly network: NetworkService) {}

  @Get()
  getOverview() {
    return this.network.getOverview();
  }
}
