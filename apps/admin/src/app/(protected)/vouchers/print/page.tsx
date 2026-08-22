'use client';

import { Ticket } from '@shaddai/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Voucher } from '@/lib/api';

const STORAGE_KEY = 'shaddai_admin_print_batch';

export default function PrintBatchPage() {
  const [vouchers, setVouchers] = useState<Voucher[] | null>(null);

  useEffect(() => {
    // sessionStorage isn't available during SSR, so this has to happen post-mount rather than
    // in a lazy useState initializer.
    const raw = sessionStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVouchers(raw ? (JSON.parse(raw) as Voucher[]) : []);
  }, []);

  if (vouchers === null) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Printable batch</h1>
          <p className="mt-1 text-sm text-muted">{vouchers.length} vouchers ready to print.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/vouchers"
            className="rounded-btn border-[1.5px] border-line px-4 py-2.5 text-sm font-bold text-ink"
          >
            Back to vouchers
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-btn bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep"
          >
            Print
          </button>
        </div>
      </div>

      {vouchers.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          No batch to print — create a batch of vouchers first, then use &quot;Print tickets&quot;
          from the success message.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((voucher) => (
            <Ticket
              key={voucher.id}
              code={voucher.code}
              planLabel={voucher.plan.name}
              expiryLabel={voucher.expiresAt ? `Expires ${voucher.expiresAt.slice(0, 10)}` : 'No fixed expiry'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
