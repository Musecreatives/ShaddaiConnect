import type { FirewallStatus } from '@/lib/api';
import { getFirewallStatusServer } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

const GATEWAY_BADGE: Record<string, string> = {
  none: 'bg-success-tint text-success',
  online: 'bg-success-tint text-success',
  down: 'bg-danger-tint text-danger',
  loss: 'bg-amber-tint text-amber',
  delay: 'bg-amber-tint text-amber',
};

function gatewayLabel(status: string): string {
  // pfSense reports a healthy gateway as "none" (i.e. no problems), which reads as an error to
  // anyone who hasn't seen it before.
  return status === 'none' || status === '' ? 'Online' : status;
}

export default async function FirewallPage() {
  let status: FirewallStatus | null = null;
  let error: string | null = null;
  try {
    status = await getFirewallStatusServer();
  } catch {
    error = 'Could not reach pfSense. Read-only view — nothing has changed.';
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Firewall / VPN</h1>
        <p className="mt-1 text-sm text-muted">
          Read-only view of pfSense. Changes are made in the pfSense web UI — a bad rule here
          would take the whole network down, so this console never writes them.
        </p>
      </div>

      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {status && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-bold text-ink">Gateways</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {status.gateways.map((g) => (
                <div key={g.name} className="rounded-card border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-ink">{g.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${
                        GATEWAY_BADGE[g.status] ?? 'bg-page text-muted'
                      }`}
                    >
                      {gatewayLabel(g.status)}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-[11.5px] text-muted">
                    <span>Delay {g.delay || '—'}</span>
                    <span>Loss {g.loss || '—'}</span>
                  </div>
                </div>
              ))}
              {status.gateways.length === 0 && (
                <p className="text-sm text-muted">No gateways reported.</p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-bold text-ink">VPN</h2>
            <div className="rounded-card border border-line bg-surface p-4 text-sm">
              {!status.wireguard.packageInstalled &&
              status.wireguard.tunnels.length === 0 &&
              status.openvpnClients.length === 0 ? (
                <p className="text-muted">
                  No VPN configured. The WireGuard package isn&apos;t installed on pfSense.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {status.wireguard.tunnels.map((t) => (
                    <div key={t.name} className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-ink">
                        {t.name} {t.address && <span className="text-muted">· {t.address}</span>}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${
                          t.enabled ? 'bg-success-tint text-success' : 'bg-page text-muted'
                        }`}
                      >
                        {t.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                  {status.openvpnClients.map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-ink">
                        OpenVPN · {c.description || c.server || 'client'}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${
                          c.disabled ? 'bg-page text-muted' : 'bg-success-tint text-success'
                        }`}
                      >
                        {c.disabled ? 'Disabled' : 'Enabled'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-bold text-ink">
              Firewall rules ({status.rules.length})
            </h2>
            <div className="overflow-x-auto rounded-card border border-line bg-surface">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Interface</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Proto</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">Port</th>
                    <th className="px-4 py-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {status.rules.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b border-line last:border-0 ${r.disabled ? 'opacity-40' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{r.interface}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase ${
                            r.action === 'pass'
                              ? 'bg-success-tint text-success'
                              : 'bg-danger-tint text-danger'
                          }`}
                        >
                          {r.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{r.protocol}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.source}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.destination}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.port || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted">{r.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-display text-sm font-bold text-ink">
              Port forwards ({status.nat.length})
            </h2>
            {status.nat.length === 0 ? (
              <p className="rounded-card border border-line bg-surface px-4 py-6 text-center text-sm text-muted">
                No port forwards configured.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-card border border-line bg-surface">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
                      <th className="px-4 py-3">Interface</th>
                      <th className="px-4 py-3">Proto</th>
                      <th className="px-4 py-3">Port</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.nat.map((n, i) => (
                      <tr
                        key={i}
                        className={`border-b border-line last:border-0 ${n.disabled ? 'opacity-40' : ''}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs">{n.interface}</td>
                        <td className="px-4 py-3 text-xs text-muted">{n.protocol}</td>
                        <td className="px-4 py-3 font-mono text-xs">{n.destination_port || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {n.target}
                          {n.local_port ? `:${n.local_port}` : ''}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">{n.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
