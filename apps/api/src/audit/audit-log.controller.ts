import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from './audit.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Controller('admin/audit-log')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@Query() query: QueryAuditLogDto) {
    return this.audit.list(query.limit ?? 50, query.offset ?? 0);
  }
}
