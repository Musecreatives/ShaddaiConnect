'use client';

import { Badge } from '@shaddai/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, getVouchers, patchVoucher, type Plan, type Voucher } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';
import { CreateVoucherModal } from './CreateVoucherModal';


function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const PLAN_TYPE_CLASSES: Record<'hourly' | 'monthly', string> = {
  hourly: 'bg-brand-blue-light/20 text-brand-blue-deep',
  monthly: 'bg-purple-100 text-purple-700',
};

function PlanTypeTag({ planType }: { planType: 'hourly' | 'monthly' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${PLAN_TYPE_CLASSES[planType]}`}
    >
      {planType}
    </span>
  );
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
      // Pass ids in the URL rather than sessionStorage so the sheet can be reopened, refreshed
      // or bookmarked — you often need to print a batch more than once.
      router.push(`/vouchers/print?ids=${created.map((v) => v.id).join(',')}`);
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

  function handleExportCsv() {
    downloadCsv(
      `vouchers-${new Date().toISOString().slice(0, 10)}.csv`,
      vouchers.map((v) => ({
        code: v.code,
        plan: v.plan?.name ?? '',
        planType: v.plan?.planType ?? '',
        status: v.status,
        createdAt: v.createdAt,
        expiresAt: v.expiresAt ?? '',
      })),
      [
        { key: 'code', label: 'Code' },
        { key: 'plan', label: 'Plan' },
        { key: 'planType', label: 'Plan type' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created' },
        { key: 'expiresAt', label: 'Expires' },
      ],
    );
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
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-btn border border-line px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep"
          >
            Export CSV
          </button>
          {/* Prints whatever is currently listed, so an existing batch can be reprinted (or a
              filtered set printed) without generating new codes. */}
          <button
            type="button"
            onClick={() => router.push(`/vouchers/print?ids=${vouchers.map((v) => v.id).join(',')}`)}
            disabled={vouchers.length === 0}
            className="rounded-btn border border-line px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep disabled:opacity-35"
          >
            Print these ({vouchers.length})
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-btn bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep"
          >
            + New voucher batch
          </button>
        </div>
      </div>

      {/* FAB — the header button is hidden below sm since "+ New voucher batch" doesn't fit
          next to the title on a phone screen. */}
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        aria-label="New voucher batch"
        className="fixed bottom-[calc(70px+env(safe-area-inset-bottom))] right-5 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white shadow-lg sm:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <div className="flex gap-2">
        {['', 'unused', 'active', 'expired', 'disabled'].map((status) => (
          <button
            key={status || 'all'}
            type="button"
            onClick={() => handleFilterChange(status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              statusFilter === status
                ? 'border-brand-blue bg-brand-blue-light/20 text-brand-blue-deep'
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

      {/* Card list below sm — a table with 6 columns doesn't fit a phone screen usefully. */}
      <div className="flex flex-col gap-2 sm:hidden">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="flex items-center justify-between rounded-card border border-line bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <div className="font-mono text-[13px] font-semibold text-ink">{voucher.code}</div>
              <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-muted">
                <span className="truncate">
                  {voucher.plan?.name ?? '—'} · {formatDate(voucher.createdAt)}
                </span>
                {voucher.plan && <PlanTypeTag planType={voucher.plan.planType} />}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge status={voucher.status} />
              {voucher.status === 'disabled' ? (
                <button
                  type="button"
                  disabled={busyId === voucher.id}
                  onClick={() => handleAction(voucher.id, 'enable')}
                  className="text-[11px] font-semibold text-brand-blue-deep disabled:opacity-40"
                >
                  Enable
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busyId === voucher.id}
                  onClick={() => handleAction(voucher.id, 'disable')}
                  className="text-[11px] font-semibold text-danger disabled:opacity-40"
                >
                  Disable
                </button>
              )}
            </div>
          </div>
        ))}
        {vouchers.length === 0 && (
          <div className="rounded-card border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
            No vouchers match this filter.
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-card border border-line bg-surface sm:block">
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{voucher.plan?.name ?? '—'}</span>
                    {voucher.plan && <PlanTypeTag planType={voucher.plan.planType} />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge status={voucher.status} />
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(voucher.createdAt)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(voucher.expiresAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {voucher.plan?.planType === 'monthly' && voucher.status !== 'disabled' && (
                      <button
                        type="button"
                        disabled={busyId === voucher.id}
                        onClick={() => handleExtend(voucher.id)}
                        className="text-xs font-semibold text-brand-blue-deep disabled:opacity-40"
                      >
                        Extend
                      </button>
                    )}
                    {voucher.status === 'disabled' ? (
                      <button
                        type="button"
                        disabled={busyId === voucher.id}
                        onClick={() => handleAction(voucher.id, 'enable')}
                        className="text-xs font-semibold text-brand-blue-deep disabled:opacity-40"
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
