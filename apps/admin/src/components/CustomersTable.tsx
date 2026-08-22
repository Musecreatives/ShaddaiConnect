'use client';

import { useMemo, useState } from 'react';
import type { CustomerRow } from '@/lib/api';

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

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, or phone…"
        className="w-full max-w-sm rounded-btn border-[1.5px] border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand-blue focus:outline-none sm:w-80"
      />

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
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
