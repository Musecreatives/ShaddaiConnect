import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuerySessionsDto } from './dto/query-sessions.dto';
import { SessionsService } from './sessions.service';

@Controller('admin/sessions')
@UseGuards(JwtAuthGuard)
export class AdminSessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  list(@Query() query: QuerySessionsDto) {
    return this.sessions.list(query);
  }
}
