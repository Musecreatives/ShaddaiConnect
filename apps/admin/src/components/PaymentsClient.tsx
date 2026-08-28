'use client';

import { useState } from 'react';
import { getPayments, type AdminPaymentRow } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';

const STATUS_STYLES: Record<AdminPaymentRow['status'], string> = {
  success: 'bg-success-tint text-success',
  pending: 'bg-amber-tint text-amber',
  failed: 'bg-danger-tint text-danger',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PaymentsClient({
  initialPayments,
  total,
}: {
  initialPayments: AdminPaymentRow[];
  total: number;
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [statusFilter, setStatusFilter] = useState('');

  async function handleFilterChange(status: string) {
    setStatusFilter(status);
    const result = await getPayments(status ? { status } : {});
    setPayments(result.payments);
  }

  function handleExportCsv() {
    downloadCsv(
      `payments-${new Date().toISOString().slice(0, 10)}.csv`,
      payments.map((p) => ({
        reference: p.reference,
        customer: p.customerEmail ?? p.customerPhone ?? '',
        plan: p.planName ?? '',
        amountNaira: p.amountNaira,
        status: p.status,
        createdAt: p.createdAt,
      })),
      [
        { key: 'reference', label: 'Reference' },
        { key: 'customer', label: 'Customer' },
        { key: 'plan', label: 'Plan' },
        { key: 'amountNaira', label: 'Amount (NGN)' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Date' },
      ],
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Payments</h1>
          <p className="mt-1 text-sm text-muted">{total} total · synced from Paystack.</p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-btn border border-line px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep"
        >
          Export CSV
        </button>
      </div>

      <div className="flex gap-2">
        {['', 'pending', 'success', 'failed'].map((status) => (
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

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono">
                  {/* Best-effort deep link — Paystack's dashboard URL scheme isn't publicly
                      documented; verify this actually lands on the transaction before relying
                      on it, or replace with dashboard.paystack.com and search manually. */}
                  <a
                    href={`https://dashboard.paystack.com/#/transactions?query=${payment.reference}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-blue-deep underline"
                    title="Open in Paystack dashboard"
                  >
                    {payment.reference}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted">
                  {payment.customerEmail ?? payment.customerPhone ?? '—'}
                </td>
                <td className="px-4 py-3">{payment.planName ?? '—'}</td>
                <td className="px-4 py-3 font-mono">
                  ₦{payment.amountNaira.toLocaleString('en-NG')}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${STATUS_STYLES[payment.status]}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(payment.createdAt)}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  No payments match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
