'use client';

import { useMemo, useState } from 'react';
import type { CustomerRow } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.phone].some((field) => field?.toLowerCase().includes(q)),
    );
  }, [customers, query]);

  function handleExportCsv() {
    downloadCsv(
      `customers-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((c) => ({
        name: c.name ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        voucherCount: c.voucherCount,
        totalPaidNaira: c.totalPaidNaira,
        createdAt: c.createdAt,
      })),
      [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'voucherCount', label: 'Vouchers' },
        { key: 'totalPaidNaira', label: 'Total paid (NGN)' },
        { key: 'createdAt', label: 'Since' },
      ],
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="min-w-50 flex-1 rounded-btn border-[1.5px] border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand-blue focus:outline-none sm:max-w-sm"
        />
        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-btn border border-line px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Vouchers</th>
              <th className="px-4 py-3 font-semibold">Total paid</th>
              <th className="px-4 py-3 font-semibold">Since</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold text-ink">
                  {customer.name ?? <span className="font-normal text-muted">—</span>}
                </td>
                <td className="px-4 py-3 text-muted">
                  {customer.email ?? customer.phone ?? '—'}
                </td>
                <td className="px-4 py-3">{customer.voucherCount}</td>
                <td className="px-4 py-3 font-mono">
                  ₦{customer.totalPaidNaira.toLocaleString('en-NG')}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(customer.createdAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  {customers.length === 0 ? 'No customers yet.' : 'No customers match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
