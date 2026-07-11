import { getNetworkOverviewServer } from '@/lib/server-api';

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', { weekday: 'short' });
}

export default async function NetworkPage() {
  const { nas, dailyUsage, totalDataAllTimeMb } = await getNetworkOverviewServer();
  const maxMb = Math.max(...dailyUsage.map((d) => d.totalMb), 1);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Network &amp; Usage</h1>
        <p className="mt-1 text-sm text-muted">
          {totalDataAllTimeMb >= 1000
            ? `${(totalDataAllTimeMb / 1000).toFixed(1)} GB`
            : `${totalDataAllTimeMb.toFixed(1)} MB`}{' '}
          transferred all-time.
        </p>
      </div>

      <div className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">
          Data usage, last 14 days
        </h2>
        <div className="flex h-32 items-end gap-2">
          {dailyUsage.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-[3px] bg-cyan"
                  style={{ height: `${Math.max(4, (day.totalMb / maxMb) * 100)}%` }}
                  title={`${day.totalMb.toFixed(1)} MB`}
                />
              </div>
              <span className="text-[10px] text-muted">{formatDay(day.date)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-ink">Access points (NAS)</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Address</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {nas.map((n) => (
              <tr key={n.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold text-ink">{n.shortname ?? n.nasname}</td>
                <td className="px-4 py-3 font-mono text-muted">{n.nasname}</td>
                <td className="px-4 py-3 capitalize text-muted">{n.type ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{n.description ?? '—'}</td>
              </tr>
            ))}
            {nas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">
                  No RADIUS clients (NAS) configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
