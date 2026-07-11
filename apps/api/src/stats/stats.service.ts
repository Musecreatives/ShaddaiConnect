import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminStats {
  revenueToday: number;
  revenueYesterday: number;
  revenueLast7Days: number;
  /** Daily revenue for the last 7 days, oldest first — for the Dashboard's sparkline. */
  revenueTrend: number[];
  activeSessions: number;
  vouchersIssuedToday: number;
  vouchersIssuedTotal: number;
  dataUsedTodayMb: number;
}

function startOfDay(daysAgo: number): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - daysAgo);
  return d;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<AdminStats> {
    const today = startOfDay(0);
    const yesterday = startOfDay(1);
    const last7Days = startOfDay(6); // today + 6 prior days = 7 days of trend

    const [
      revenueTodayAgg,
      revenueYesterdayAgg,
      revenueWeekAgg,
      trendAggs,
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
        where: { status: 'success', createdAt: { gte: yesterday, lt: today } },
      }),
      this.prisma.payment.aggregate({
        _sum: { amountNaira: true },
        where: { status: 'success', createdAt: { gte: last7Days } },
      }),
      // 7 small per-day aggregates rather than a raw SQL date-trunc/groupBy — Prisma has no
      // portable groupBy-by-day helper, and this is simple, correct, and only runs on dashboard
      // load (not a hot path).
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const from = startOfDay(6 - i);
          const to = startOfDay(5 - i);
          return this.prisma.payment.aggregate({
            _sum: { amountNaira: true },
            where: {
              status: 'success',
              createdAt: i === 6 ? { gte: from } : { gte: from, lt: to },
            },
          });
        }),
      ),
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
      revenueYesterday: Number(revenueYesterdayAgg._sum.amountNaira ?? 0),
      revenueLast7Days: Number(revenueWeekAgg._sum.amountNaira ?? 0),
      revenueTrend: trendAggs.map((agg) => Number(agg._sum.amountNaira ?? 0)),
      activeSessions,
      vouchersIssuedToday,
      vouchersIssuedTotal,
      dataUsedTodayMb: Number(totalOctets) / 1_000_000,
    };
  }
}
