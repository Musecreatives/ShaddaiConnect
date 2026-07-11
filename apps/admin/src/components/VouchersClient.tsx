'use client';

import { Badge } from '@shaddai/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, getVouchers, patchVoucher, type Plan, type Voucher } from '@/lib/api';
import { CreateVoucherModal } from './CreateVoucherModal';

const STORAGE_KEY = 'shaddai_admin_print_batch';

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function VouchersClient({
  initialVouchers,
  plans,
}: {
  initialVouchers: Voucher[];
  plans: Plan[];
}) {
  const router = useRouter();
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh(status?: string) {
    setVouchers(await getVouchers(status ? { status } : {}));
  }

  async function handleFilterChange(status: string) {
    setStatusFilter(status);
    await refresh(status || undefined);
  }

  function handleCreated(created: Voucher[]) {
    setShowCreate(false);
    if (created.length > 1) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(created));
      router.push('/vouchers/print');
      return;
    }
    setVouchers((prev) => [...created, ...prev]);
  }

  async function handleAction(id: number, action: 'disable' | 'enable') {
    setBusyId(id);
    setError(null);
    try {
      const updated = await patchVoucher(id, { action });
      setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, status: updated.status } : v)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Could not ${action} voucher.`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleExtend(id: number) {
    const input = window.prompt('Extend validity by how many days?', '30');
    if (!input) return;
    const additionalDays = Number(input);
    if (!Number.isInteger(additionalDays) || additionalDays <= 0) {
      setError('Enter a whole number of days greater than 0.');
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const updated = await patchVoucher(id, { action: 'extend', additionalDays });
      setVouchers((prev) =>
        prev.map((v) => (v.id === id ? { ...v, expiresAt: updated.expiresAt } : v)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not extend voucher.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Vouchers</h1>
          <p className="mt-1 text-sm text-muted">Issue, disable, and track voucher codes.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-btn bg-navy px-4 py-2.5 text-sm font-bold text-white"
        >
          + New voucher batch
        </button>
      </div>

      <div className="flex gap-2">
        {['', 'unused', 'active', 'expired', 'disabled'].map((status) => (
          <button
            key={status || 'all'}
            type="button"
            onClick={() => handleFilterChange(status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              statusFilter === status
                ? 'border-cyan bg-cyan-tint text-cyan-deep'
                : 'border-line text-muted'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Expires</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono">{voucher.code}</td>
                <td className="px-4 py-3">{voucher.plan.name}</td>
                <td className="px-4 py-3">
                  <Badge status={voucher.status} />
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(voucher.createdAt)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(voucher.expiresAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {voucher.plan.planType === 'monthly' && voucher.status !== 'disabled' && (
                      <button
                        type="button"
                        disabled={busyId === voucher.id}
                        onClick={() => handleExtend(voucher.id)}
                        className="text-xs font-semibold text-cyan-deep disabled:opacity-40"
                      >
                        Extend
                      </button>
                    )}
                    {voucher.status === 'disabled' ? (
                      <button
                        type="button"
                        disabled={busyId === voucher.id}
                        onClick={() => handleAction(voucher.id, 'enable')}
                        className="text-xs font-semibold text-cyan-deep disabled:opacity-40"
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === voucher.id}
                        onClick={() => handleAction(voucher.id, 'disable')}
                        className="text-xs font-semibold text-danger disabled:opacity-40"
                      >
                        Disable
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  No vouchers match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateVoucherModal
          plans={plans}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
