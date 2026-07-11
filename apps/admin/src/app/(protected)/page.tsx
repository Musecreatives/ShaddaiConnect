import { Badge } from '@shaddai/ui';
import { StatCard } from '@/components/StatCard';
import { getPaymentsServer, getStatsServer, getVouchersServer } from '@/lib/server-api';

function naira(n: number): string {
  return `₦${n.toLocaleString('en-NG')}`;
}

function deltaVsYesterday(today: number, yesterday: number): number | undefined {
  if (yesterday === 0) return undefined;
  return ((today - yesterday) / yesterday) * 100;
}

function greeting(): string {
  const hour = new Date().toLocaleString('en-NG', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Africa/Lagos',
  });
  const h = Number(hour);
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default async function DashboardPage() {
  const [stats, vouchers, { payments }] = await Promise.all([
    getStatsServer(),
    getVouchersServer(),
    getPaymentsServer(),
  ]);

  const today = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Lagos',
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">{greeting()}</h1>
        <p className="mt-1 text-sm text-muted">{today} · Ugbowo BDPA Estate</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Revenue today"
          value={naira(stats.revenueToday)}
          deltaPct={deltaVsYesterday(stats.revenueToday, stats.revenueYesterday)}
          trend={stats.revenueTrend}
        />
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-display text-sm font-semibold text-ink">Recent vouchers</h2>
          </div>
          <table className="w-full text-left text-sm">
            <tbody>
              {vouchers.slice(0, 5).map((voucher) => (
                <tr key={voucher.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[13px]">{voucher.code}</td>
                  <td className="px-4 py-2.5 text-muted">{voucher.plan.name}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Badge status={voucher.status} />
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-muted">
                    No vouchers issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-card border border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-display text-sm font-semibold text-ink">Recent payments</h2>
          </div>
          <table className="w-full text-left text-sm">
            <tbody>
              {payments.slice(0, 5).map((payment) => (
                <tr key={payment.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5 text-muted">
                    {payment.customerEmail ?? payment.customerPhone ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    ₦{payment.amountNaira.toLocaleString('en-NG')}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${
                        payment.status === 'success'
                          ? 'bg-success-tint text-success'
                          : payment.status === 'pending'
                            ? 'bg-amber-tint text-amber'
                            : 'bg-danger-tint text-danger'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-muted">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Data used today"
          value={`${stats.dataUsedTodayMb.toFixed(1)} MB`}
          hint="Approximate — sessions that started today"
        />
      </div>
    </div>
  );
}
