import { Badge } from '@shaddai/ui';
import { StatCard } from '@/components/StatCard';
import {
  getFraudSignalsServer,
  getNetworkOverviewServer,
  getPaymentsServer,
  getStatsServer,
  getTrialFeedbackServer,
  getVouchersServer,
  getWaitlistServer,
} from '@/lib/server-api';

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
  const [stats, vouchers, { payments }, fraudSignals, waitlist, trialFeedback, network] = await Promise.all([
    getStatsServer(),
    getVouchersServer(),
    getPaymentsServer(),
    getFraudSignalsServer(),
    getWaitlistServer(),
    getTrialFeedbackServer(),
    getNetworkOverviewServer(),
  ]);
  const networkOnline = network.nas.length > 0;
  const cambiumOk = network.cambiumBackhaul.rssiDbm !== null && network.cambiumBackhaul.rssiDbm >= -65;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const waitlistThisWeek = waitlist.filter((w) => new Date(w.createdAt).getTime() >= weekAgo).length;

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

      {fraudSignals.length > 0 && (
        <div className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-danger">
            {fraudSignals.length} customer{fraudSignals.length === 1 ? '' : 's'} with repeated
            failed payments
          </h2>
          <p className="mt-0.5 text-xs text-danger/80">
            Not an automatic block — a heads-up to glance at, since legitimate customers retry
            failed cards too.
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-ink">
            {fraudSignals.slice(0, 5).map((s) => (
              <li key={s.customerId} className="flex items-center justify-between">
                <span>{s.email ?? s.phone ?? `Customer #${s.customerId}`}</span>
                <span className="font-mono text-xs text-muted">
                  {s.failedCount} failed attempts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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

      <div className="grid grid-cols-2 gap-4 rounded-card bg-navy p-5 text-white sm:grid-cols-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Network status
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${networkOnline ? 'bg-success' : 'bg-line'}`} />
            <span className="text-sm font-semibold">{networkOnline ? 'Online' : 'No NAS configured'}</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Cambium signal
          </div>
          <div className="mt-1.5 font-mono text-lg font-semibold">
            {network.cambiumBackhaul.rssiDbm !== null ? (
              <span className={cambiumOk ? 'text-success' : 'text-amber'}>
                {network.cambiumBackhaul.rssiDbm} dBm
              </span>
            ) : (
              <span className="text-white/40">
                {network.cambiumBackhaul.configured ? 'Unreachable' : 'Not configured'}
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Active sessions
          </div>
          <div className="mt-1.5 font-mono text-lg font-semibold">{stats.activeSessions}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
            Access points
          </div>
          <div className="mt-1.5 font-mono text-lg font-semibold">{network.nas.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-display text-sm font-semibold text-ink">Top bandwidth users</h2>
          </div>
          <table className="w-full text-left text-sm">
            <tbody>
              {network.topBandwidthUsers.slice(0, 5).map((user) => {
                const maxMb = network.topBandwidthUsers[0]?.totalMb || 1;
                const pct = Math.max(4, (user.totalMb / maxMb) * 100);
                return (
                  <tr key={user.code} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 font-mono text-[13px]">{user.code}</td>
                    <td className="px-4 py-2.5 text-right text-muted">
                      {user.totalMb >= 1000 ? `${(user.totalMb / 1000).toFixed(1)} GB` : `${user.totalMb.toFixed(1)} MB`}
                    </td>
                    <td className="w-24 px-4 py-2.5">
                      <div className="h-1 overflow-hidden rounded-full bg-brand-blue-light/20">
                        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {network.topBandwidthUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted">
                    No usage data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Data used today"
          value={`${stats.dataUsedTodayMb.toFixed(1)} MB`}
          hint="Approximate — sessions that started today"
        />
        <StatCard
          label="Waitlist signups"
          value={String(waitlist.length)}
          hint={waitlistThisWeek > 0 ? `+${waitlistThisWeek} this week` : undefined}
        />
        <StatCard label="Trial feedback" value={String(trialFeedback.length)} hint="Total responses" />
      </div>
    </div>
  );
}
