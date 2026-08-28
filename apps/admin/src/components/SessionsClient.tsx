'use client';

import { SignalMeter } from '@shaddai/ui';
import { useEffect, useState } from 'react';
import { ApiError, blockMac, disconnectVoucher, getSessions, type SessionRow } from '@/lib/api';

const LIVE_REFRESH_MS = 10_000;

function formatBytes(bytes: number): string {
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(0)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SessionsClient({
  initialSessions,
  initialTotal,
}: {
  initialSessions: SessionRow[];
  initialTotal: number;
}) {
  const [view, setView] = useState<'live' | 'all'>('live');
  const [sessions, setSessions] = useState(initialSessions);
  const [total, setTotal] = useState(initialTotal);
  const [blockingMac, setBlockingMac] = useState<string | null>(null);
  const [blockedMacs, setBlockedMacs] = useState<Set<string>>(new Set());
  const [disconnectingCode, setDisconnectingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleBlock(mac: string) {
    if (!window.confirm(`Block device ${mac}? This disables any voucher it's used, on any plan.`)) {
      return;
    }
    setBlockingMac(mac);
    setError(null);
    try {
      await blockMac(mac);
      setBlockedMacs((prev) => new Set(prev).add(mac.toLowerCase()));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Could not block ${mac}.`);
    } finally {
      setBlockingMac(null);
    }
  }

  async function handleDisconnect(code: string) {
    setDisconnectingCode(code);
    setError(null);
    setNotice(null);
    try {
      const result = await disconnectVoucher(code);
      if (result.success) {
        setNotice(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Could not disconnect ${code}.`);
    } finally {
      setDisconnectingCode(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getSessions(view);
      if (!cancelled) {
        setSessions(result.sessions);
        setTotal(result.total);
      }
    }

    if (view !== 'live') {
      load();
      return;
    }

    load();
    const interval = setInterval(load, LIVE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [view]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Sessions</h1>
          <p className="mt-1 text-sm text-muted">
            {total} {view === 'live' ? 'connected now' : 'total'} · refreshes automatically while
            viewing live
          </p>
        </div>
        <div className="flex gap-2">
          {(['live', 'all'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
                view === v ? 'border-brand-blue bg-brand-blue-light/20 text-brand-blue-deep' : 'border-line text-muted'
              }`}
            >
              {v === 'live' ? 'Live' : 'History'}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <p className="rounded-card border border-success/30 bg-success-tint px-4 py-3 text-sm text-success">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">MAC</th>
              <th className="px-4 py-3 font-semibold">IP</th>
              <th className="px-4 py-3 font-semibold">Started</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Down / Up</th>
              <th className="px-4 py-3 font-semibold">AP</th>
              <th className="px-4 py-3 font-semibold">Signal</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const mac = session.macAddress?.toLowerCase();
              const isBlocked = mac && blockedMacs.has(mac);
              return (
                <tr key={session.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span>{session.username}</span>
                      {session.stale && (
                        <span
                          title="Still open in radacct but the voucher is expired/disabled — pfSense/FreeRADIUS never sent Accounting-Stop. An auto-disconnect job retries a CoA kick every minute."
                          className="inline-flex items-center rounded-full bg-amber-tint px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-amber"
                        >
                          Stale
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">{session.macAddress || '—'}</td>
                  <td className="px-4 py-3 font-mono text-muted">{session.ipAddress || '—'}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(session.startedAt)}</td>
                  <td className="px-4 py-3 font-mono text-muted">
                    {formatDuration(session.durationSeconds)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatBytes(session.downloadBytes)} / {formatBytes(session.uploadBytes)}
                  </td>
                  <td className="px-4 py-3 text-muted">{session.apName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <SignalMeter live={session.live} />
                      {session.signalRssi !== null && (
                        <span className="font-mono text-xs text-muted">{session.signalRssi} dBm</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {session.live && (
                        <button
                          type="button"
                          disabled={disconnectingCode === session.username}
                          onClick={() => handleDisconnect(session.username)}
                          className="text-xs font-semibold text-amber disabled:opacity-40"
                        >
                          {disconnectingCode === session.username ? 'Disconnecting…' : 'Disconnect now'}
                        </button>
                      )}
                      {session.macAddress &&
                        (isBlocked ? (
                          <span className="text-xs font-semibold text-danger">Blocked</span>
                        ) : (
                          <button
                            type="button"
                            disabled={blockingMac === session.macAddress}
                            onClick={() => handleBlock(session.macAddress)}
                            className="text-xs font-semibold text-danger disabled:opacity-40"
                          >
                            Block device
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              );
            })}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted">
                  {view === 'live' ? 'No devices connected right now.' : 'No session history yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
