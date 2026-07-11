import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminStats {
  revenueToday: number;
  revenueLast7Days: number;
  activeSessions: number;
  vouchersIssuedToday: number;
  vouchersIssuedTotal: number;
  dataUsedTodayMb: number;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<AdminStats> {
    const today = startOfToday();
    const last7Days = daysAgo(7);

    const [
      revenueTodayAgg,
      revenueWeekAgg,
      activeSessions,
      vouchersIssuedToday,
      vouchersIssuedTotal,
      dataUsedAgg,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amountNaira: true },
        where: { status: 'success', createdAt: { gte: today } },
      }),
      this.prisma.payment.aggregate({
        _sum: { amountNaira: true },
        where: { status: 'success', createdAt: { gte: last7Days } },
      }),
      this.prisma.radAcct.count({ where: { acctStopTime: null } }),
      this.prisma.voucher.count({ where: { createdAt: { gte: today } } }),
      this.prisma.voucher.count(),
      // Approximate "today's data": sessions that started today. Doesn't account for
      // sessions spanning midnight — good enough for a dashboard KPI, not a billing figure.
      this.prisma.radAcct.aggregate({
        _sum: { acctInputOctets: true, acctOutputOctets: true },
        where: { acctStartTime: { gte: today } },
      }),
    ]);

    const inputOctets = dataUsedAgg._sum.acctInputOctets ?? BigInt(0);
    const outputOctets = dataUsedAgg._sum.acctOutputOctets ?? BigInt(0);
    const totalOctets = inputOctets + outputOctets;

    return {
      revenueToday: Number(revenueTodayAgg._sum.amountNaira ?? 0),
      revenueLast7Days: Number(revenueWeekAgg._sum.amountNaira ?? 0),
      activeSessions,
      vouchersIssuedToday,
      vouchersIssuedTotal,
      dataUsedTodayMb: Number(totalOctets) / 1_000_000,
    };
  }
}
