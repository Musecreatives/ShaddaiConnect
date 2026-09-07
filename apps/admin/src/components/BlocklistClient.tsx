'use client';

import { useState } from 'react';
import { ApiError, blockMac, unblockMac, type BlockedMac } from '@/lib/api';

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BlocklistClient({ initialBlocked }: { initialBlocked: BlockedMac[] }) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [macInput, setMacInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleBlock(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await blockMac(macInput.trim(), reasonInput.trim() || undefined);
      setBlocked((prev) => [result, ...prev]);
      setMacInput('');
      setReasonInput('');
      setNotice(
        result.disabledVoucherCount > 0
          ? `Blocked — ${result.disabledVoucherCount} existing voucher(s) on this device disabled too.`
          : 'Blocked.',
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to block device.');
    } finally {
      setBusy(false);
    }
  }

  async function handleUnblock(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await unblockMac(id);
      setBlocked((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to unblock device.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Blocklist</h1>
        <p className="mt-1 text-sm text-muted">
          Devices banned by MAC address — applies to every plan. Blocking disables any voucher
          already in use on that device and stops future reconnects (does not kick an
          already-open session — see Network for why).
        </p>
      </div>

      <form onSubmit={handleBlock} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-muted">MAC address</label>
          <input
            type="text"
            value={macInput}
            onChange={(e) => setMacInput(e.target.value)}
            placeholder="94:65:9c:7f:28:67"
            required
            className="w-full rounded-btn border-[1.5px] border-line px-3 py-2 font-mono text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold text-muted">Reason (optional)</label>
          <input
            type="text"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="Repeat trial abuse"
            className="w-full rounded-btn border-[1.5px] border-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-btn bg-danger px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-danger/90 disabled:opacity-40"
        >
          {busy ? 'Blocking…' : 'Block device'}
        </button>
      </form>

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
            <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">MAC address</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Blocked</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {blocked.map((b) => (
              <tr key={b.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono">{b.macAddress}</td>
                <td className="px-4 py-3 text-muted">{b.reason ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{formatDate(b.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    onClick={() => handleUnblock(b.id)}
                    className="text-xs font-semibold text-brand-blue-deep disabled:opacity-40"
                  >
                    Unblock
                  </button>
                </td>
              </tr>
            ))}
            {blocked.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">
                  No devices blocked.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
