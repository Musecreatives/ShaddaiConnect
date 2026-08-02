import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CambiumSnmpService, type CambiumBackhaulStatus } from './cambium-snmp.service';

export interface NasRow {
  id: number;
  nasname: string;
  shortname: string | null;
  type: string | null;
  description: string | null;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  totalMb: number;
}

export interface NetworkOverview {
  nas: NasRow[];
  dailyUsage: DailyUsage[]; // last 14 days, oldest first
  totalDataAllTimeMb: number;
  cambiumBackhaul: CambiumBackhaulStatus;
}

function startOfDay(daysAgo: number): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - daysAgo);
  return d;
}

const TREND_DAYS = 14;

@Injectable()
export class NetworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cambium: CambiumSnmpService,
  ) {}

  async getOverview(): Promise<NetworkOverview> {
    // Never select `secret` — it's the live RADIUS shared secret (CLAUDE.md: never expose it).
    const [nas, dailyAggs, totalAgg, cambiumBackhaul] = await Promise.all([
      this.prisma.nas.findMany({
        select: { id: true, nasname: true, shortname: true, type: true, description: true },
        orderBy: { id: 'asc' },
      }),
      Promise.all(
        Array.from({ length: TREND_DAYS }, (_, i) => {
          const from = startOfDay(TREND_DAYS - 1 - i);
          const to = startOfDay(TREND_DAYS - 2 - i);
          const isToday = i === TREND_DAYS - 1;
          return this.prisma.radAcct.aggregate({
            _sum: { acctInputOctets: true, acctOutputOctets: true },
            where: { acctStartTime: isToday ? { gte: from } : { gte: from, lt: to } },
          });
        }),
      ),
      this.prisma.radAcct.aggregate({
        _sum: { acctInputOctets: true, acctOutputOctets: true },
      }),
      this.cambium.getBackhaulStatus(),
    ]);

    const dailyUsage: DailyUsage[] = dailyAggs.map((agg, i) => {
      const date = startOfDay(TREND_DAYS - 1 - i);
      const bytes = Number(agg._sum.acctInputOctets ?? 0) + Number(agg._sum.acctOutputOctets ?? 0);
      return { date: date.toISOString().slice(0, 10), totalMb: bytes / 1_000_000 };
    });

    const totalBytes =
      Number(totalAgg._sum.acctInputOctets ?? 0) + Number(totalAgg._sum.acctOutputOctets ?? 0);

    return { nas, dailyUsage, totalDataAllTimeMb: totalBytes / 1_000_000, cambiumBackhaul };
  }
}
