import { getCustomersServer } from '@/lib/server-api';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function CustomersPage() {
  const { customers, total } = await getCustomersServer();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Customers</h1>
        <p className="mt-1 text-sm text-muted">{total} total, from purchases and manual entries.</p>
      </div>

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
            {customers.map((customer) => (
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
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
