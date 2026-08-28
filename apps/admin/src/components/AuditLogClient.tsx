'use client';

import type { AuditLogEntry } from '@/lib/api';

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ');
}

export function AuditLogClient({
  initialEntries,
  initialTotal,
}: {
  initialEntries: AuditLogEntry[];
  initialTotal: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Audit log</h1>
        <p className="mt-1 text-sm text-muted">
          {initialTotal} recorded action{initialTotal === 1 ? '' : 's'} — who blocked/unblocked
          devices, disabled/enabled/extended vouchers, and automatic system actions.
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Admin</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Target</th>
              <th className="px-4 py-3 font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody>
            {initialEntries.map((entry) => (
              <tr key={entry.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-muted">{formatDate(entry.createdAt)}</td>
                <td className="px-4 py-3">
                  {entry.adminEmail === 'system' ? (
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      System
                    </span>
                  ) : (
                    entry.adminEmail
                  )}
                </td>
                <td className="px-4 py-3 capitalize">{formatAction(entry.action)}</td>
                <td className="px-4 py-3 font-mono text-muted">
                  {entry.targetType}:{entry.targetId}
                </td>
                <td className="px-4 py-3 text-muted">{entry.detail ?? '—'}</td>
              </tr>
            ))}
            {initialEntries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No admin actions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
