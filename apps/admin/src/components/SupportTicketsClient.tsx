'use client';

import { useState } from 'react';
import { updateSupportTicket, type SupportTicket } from '@/lib/api';

const PRIORITY_BADGE: Record<SupportTicket['priority'], string> = {
  low: 'bg-brand-blue-light/20 text-brand-blue-deep',
  medium: 'bg-amber-tint text-amber',
  high: 'bg-danger-tint text-danger',
};

const STATUS_BADGE: Record<SupportTicket['status'], string> = {
  open: 'bg-amber-tint text-amber',
  resolved: 'bg-success-tint text-success',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SupportTicketsClient({ initialTickets }: { initialTickets: SupportTicket[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [busyId, setBusyId] = useState<number | null>(null);

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const resolvedThisWeek = tickets.filter(
    (t) => t.status === 'resolved' && new Date(t.updatedAt).getTime() >= weekAgo,
  ).length;

  async function handlePriorityChange(id: number, priority: SupportTicket['priority']) {
    setBusyId(id);
    try {
      const updated = await updateSupportTicket(id, { priority });
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } finally {
      setBusyId(null);
    }
  }

  async function handleStatusToggle(id: number, current: SupportTicket['status']) {
    setBusyId(id);
    try {
      const updated = await updateSupportTicket(id, {
        status: current === 'open' ? 'resolved' : 'open',
      });
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-line bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Open tickets</div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">{openCount}</div>
        </div>
        <div className="rounded-card border border-line bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Resolved this week
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">{resolvedThisWeek}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Message</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Received</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-line last:border-0 align-top">
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{ticket.customerName}</div>
                  <div className="text-xs text-muted">{ticket.customerEmail}</div>
                </td>
                <td className="max-w-xs px-4 py-3 text-muted">{ticket.message}</td>
                <td className="px-4 py-3">
                  <select
                    value={ticket.priority}
                    disabled={busyId === ticket.id}
                    onChange={(e) =>
                      handlePriorityChange(ticket.id, e.target.value as SupportTicket['priority'])
                    }
                    className={`rounded-full border-0 px-2.5 py-1 text-[10.5px] font-bold uppercase disabled:opacity-40 ${PRIORITY_BADGE[ticket.priority]}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={busyId === ticket.id}
                    onClick={() => handleStatusToggle(ticket.id, ticket.status)}
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase disabled:opacity-40 ${STATUS_BADGE[ticket.status]}`}
                  >
                    {ticket.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(ticket.createdAt)}</td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No support messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
