import { getNetworkOverviewServer } from '@/lib/server-api';

function formatDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', { weekday: 'short' });
}

export default async function NetworkPage() {
  const { nas, dailyUsage, totalDataAllTimeMb, cambiumBackhaul, managedDevices, knownAccessPoints } =
    await getNetworkOverviewServer();
  const maxMb = Math.max(...dailyUsage.map((d) => d.totalMb), 1);

  const cambiumOk = cambiumBackhaul.rssiDbm !== null && cambiumBackhaul.rssiDbm >= -65;
  const cambiumWarn = cambiumBackhaul.rssiDbm !== null && cambiumBackhaul.rssiDbm >= -75 && !cambiumOk;

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Cambium backhaul
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                !cambiumBackhaul.configured
                  ? 'bg-line'
                  : cambiumBackhaul.rssiDbm === null
                    ? 'bg-danger'
                    : cambiumOk
                      ? 'bg-success'
                      : cambiumWarn
                        ? 'bg-amber'
                        : 'bg-danger'
              }`}
            />
          </div>
          {!cambiumBackhaul.configured ? (
            <p className="mt-2 text-sm text-muted">Not configured</p>
          ) : cambiumBackhaul.rssiDbm === null ? (
            <p className="mt-2 text-sm text-amber">Configured, but unreachable</p>
          ) : (
            <>
              <p
                className={`mt-2 font-mono text-2xl font-bold ${
                  cambiumOk ? 'text-success' : cambiumWarn ? 'text-amber' : 'text-danger'
                }`}
              >
                {cambiumBackhaul.rssiDbm} dBm
              </p>
              <p className="mt-1 text-xs text-muted">{cambiumBackhaul.connectionStatus ?? '—'}</p>
            </>
          )}
        </div>

        <div className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Access points
            </span>
            <span className={`h-2 w-2 rounded-full ${nas.length > 0 ? 'bg-success' : 'bg-line'}`} />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">{nas.length}</p>
          <p className="mt-1 text-xs text-muted">RADIUS clients configured</p>
        </div>

        <div className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Data, all-time
            </span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-ink">
            {totalDataAllTimeMb >= 1000
              ? `${(totalDataAllTimeMb / 1000).toFixed(1)} GB`
              : `${totalDataAllTimeMb.toFixed(1)} MB`}
          </p>
          <p className="mt-1 text-xs text-muted">Transferred across all sessions</p>
        </div>
      </div>

      {cambiumBackhaul.rssiDbm !== null && cambiumBackhaul.ssid && (
        <div className="rounded-card border border-line bg-surface px-5 py-3 text-sm">
          <span className="text-muted">SSID: </span>
          <span className="font-mono text-ink">{cambiumBackhaul.ssid}</span>
        </div>
      )}

      <div className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink">
          Data usage, last 14 days
        </h2>
        <div className="flex h-32 items-end gap-2">
          {dailyUsage.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-[3px] bg-brand-blue"
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
          <h2 className="font-display text-sm font-semibold text-ink">Manage devices</h2>
          <p className="mt-0.5 text-xs text-muted">
            Jump straight into each device&apos;s own admin UI — no LAN access or tunnel needed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          {managedDevices.map((d) => (
            <a
              key={d.url}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-btn border border-line bg-page px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep"
            >
              {d.name} ↗
            </a>
          ))}
          {managedDevices.length === 0 && (
            <p className="px-1 py-2 text-sm text-muted">No managed device links configured.</p>
          )}
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-ink">Wireless access points</h2>
          <p className="mt-0.5 text-xs text-muted">
            APs not managed by Omada — static info only, no live client/signal data.
          </p>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">SSID</th>
              <th className="px-4 py-3 font-semibold">IP</th>
              <th className="px-4 py-3 font-semibold">MAC</th>
            </tr>
          </thead>
          <tbody>
            {knownAccessPoints.map((ap) => (
              <tr key={ap.macAddress} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold text-ink">{ap.name}</td>
                <td className="px-4 py-3 font-mono text-muted">{ap.ssid}</td>
                <td className="px-4 py-3 font-mono text-muted">{ap.ipAddress}</td>
                <td className="px-4 py-3 font-mono text-muted">{ap.macAddress}</td>
              </tr>
            ))}
            {knownAccessPoints.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">
                  No known access points configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-card border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-ink">Access points (NAS)</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
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
