import { StatCard } from '@/components/StatCard';
import { getStatsServer } from '@/lib/server-api';

function naira(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`;
}

export default async function DashboardPage() {
  const stats = await getStatsServer();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Live snapshot of the network right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue today" value={naira(stats.revenueToday)} />
        <StatCard label="Revenue, last 7 days" value={naira(stats.revenueLast7Days)} />
        <StatCard
          label="Active sessions"
          value={String(stats.activeSessions)}
          hint="Connected right now"
        />
        <StatCard
          label="Vouchers issued"
          value={String(stats.vouchersIssuedToday)}
          hint={`${stats.vouchersIssuedTotal} all-time`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Data used today"
          value={`${stats.dataUsedTodayMb.toFixed(1)} MB`}
          hint="Approximate — sessions that started today"
        />
      </div>
    </div>
  );
}
