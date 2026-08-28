import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordAuditParams {
  adminEmail: string;
  adminId?: number;
  action: string;
  targetType: string;
  targetId: string;
  detail?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(params: RecordAuditParams) {
    return this.prisma.adminActionLog.create({ data: params });
  }

  list(limit = 50, offset = 0) {
    return Promise.all([
      this.prisma.adminActionLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.adminActionLog.count(),
    ]).then(([entries, total]) => ({ entries, total }));
  }
}
