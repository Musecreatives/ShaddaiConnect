'use client';

import { SignalMeter } from '@shaddai/ui';
import { useEffect, useState } from 'react';
import { getSessions, type SessionRow } from '@/lib/api';

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
                view === v ? 'border-cyan bg-cyan-tint text-cyan-deep' : 'border-line text-muted'
              }`}
            >
              {v === 'live' ? 'Live' : 'History'}
            </button>
          ))}
        </div>
      </div>

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
              <th className="px-4 py-3 font-semibold">Signal</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono">{session.username}</td>
                <td className="px-4 py-3 font-mono text-muted">{session.macAddress || '—'}</td>
                <td className="px-4 py-3 font-mono text-muted">{session.ipAddress || '—'}</td>
                <td className="px-4 py-3 text-muted">{formatDate(session.startedAt)}</td>
                <td className="px-4 py-3 font-mono text-muted">
                  {formatDuration(session.durationSeconds)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {formatBytes(session.downloadBytes)} / {formatBytes(session.uploadBytes)}
                </td>
                <td className="px-4 py-3">
                  <SignalMeter live={session.live} />
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
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
