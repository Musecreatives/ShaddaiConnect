'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  CARDS_PER_PAGE,
  CARD_COLS,
  CARD_W_MM,
  VoucherCard,
  planBadge,
} from '@/components/VoucherCard';
import type { Voucher } from '@/lib/api';

const STORAGE_KEY = 'shaddai_admin_print_batch';

/** Compact stock sheet — for checking cards off as you sell them, not for cutting up. */
function VoucherList({ vouchers }: { vouchers: Voucher[] }) {
  return (
    <table className="voucher-list w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
          <th className="px-2 py-2">No.</th>
          <th className="px-2 py-2">Code</th>
          <th className="px-2 py-2">Plan</th>
          <th className="px-2 py-2">Price</th>
          <th className="px-2 py-2">Expires</th>
          <th className="px-2 py-2">Sold</th>
        </tr>
      </thead>
      <tbody>
        {vouchers.map((v, i) => (
          <tr key={v.id} className="border-b border-line">
            <td className="px-2 py-1.5 text-muted">{String(i + 1).padStart(3, '0')}</td>
            <td className="px-2 py-1.5 font-mono font-semibold">{v.code}</td>
            <td className="px-2 py-1.5">
              {v.plan ? planBadge(v.plan.name, v.plan.planType) : '—'}
            </td>
            <td className="px-2 py-1.5">
              {v.plan ? `₦${Number(v.plan.priceNaira).toLocaleString('en-NG')}` : '—'}
            </td>
            <td className="px-2 py-1.5 text-muted">
              {v.expiresAt ? v.expiresAt.slice(0, 10) : 'On first use'}
            </td>
            {/* Empty box to tick by hand when a card is sold. */}
            <td className="px-2 py-1.5">
              <span className="inline-block h-3.5 w-3.5 rounded-[2px] border border-line" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PrintBatch({
  initialVouchers,
  supportPhone,
}: {
  initialVouchers: Voucher[] | null;
  supportPhone?: string;
}) {
  const [vouchers, setVouchers] = useState<Voucher[] | null>(initialVouchers);
  const [mode, setMode] = useState<'cards' | 'list'>('cards');
  const [cutGuides, setCutGuides] = useState(true);

  useEffect(() => {
    if (initialVouchers !== null) return; // server already supplied the batch via ?ids=
    const raw = sessionStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVouchers(raw ? (JSON.parse(raw) as Voucher[]) : []);
  }, [initialVouchers]);

  if (vouchers === null) return null;

  const pages = Math.ceil(vouchers.length / CARDS_PER_PAGE);

  return (
    <div className="flex flex-col gap-5">
      {/* Screen-only chrome — excluded from the printed sheet. */}
      <div className="flex flex-col gap-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-ink">Print vouchers</h1>
            <p className="mt-1 text-sm text-muted">
              {vouchers.length} voucher{vouchers.length === 1 ? '' : 's'}
              {mode === 'cards' && (
                <>
                  {' '}
                  · {CARDS_PER_PAGE} per A4 page · {pages} page{pages === 1 ? '' : 's'}
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/vouchers"
              className="rounded-btn border-[1.5px] border-line px-4 py-2.5 text-sm font-bold text-ink"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={vouchers.length === 0}
              className="rounded-btn bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-35"
            >
              Print
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Layout</span>
            {(
              [
                ['cards', 'Cards'],
                ['list', 'Stock list'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  mode === key
                    ? 'border-brand-blue bg-brand-blue-light/20 text-brand-blue-deep'
                    : 'border-line text-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === 'cards' && (
            <label className="flex items-center gap-2 text-xs font-semibold text-muted">
              <input
                type="checkbox"
                checked={cutGuides}
                onChange={(e) => setCutGuides(e.target.checked)}
                className="h-3.5 w-3.5 accent-brand-blue"
              />
              Cut guides
            </label>
          )}
          {!supportPhone && mode === 'cards' && (
            <span className="text-xs text-muted">
              No support number set —{' '}
              <Link href="/site-content" className="font-semibold text-brand-blue-deep underline">
                add one in Site Content
              </Link>
            </span>
          )}
        </div>
      </div>

      {vouchers.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted print:hidden">
          No batch to print. Create a batch from the Vouchers page, or use &quot;Print these&quot;
          to print the vouchers currently listed.
        </p>
      ) : mode === 'cards' ? (
        <div
          className="print-sheet"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${CARD_COLS}, ${CARD_W_MM}mm)`,
            gap: '0mm',
            justifyContent: 'center',
          }}
        >
          {vouchers.map((v, i) => (
            <VoucherCard
              key={v.id}
              code={v.code}
              planName={v.plan?.name ?? '—'}
              planType={v.plan?.planType ?? 'hourly'}
              priceNaira={Number(v.plan?.priceNaira ?? 0)}
              dataCapMb={v.plan?.dataCapMb ?? null}
              supportPhone={supportPhone}
              serial={i + 1}
              cutGuides={cutGuides}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-line bg-surface p-4 print:border-0 print:p-0">
          <VoucherList vouchers={vouchers} />
        </div>
      )}

      {/*
        Real page rules rather than Tailwind `print:` utilities — these need page-level control
        utilities can't express: a fixed physical margin, cards that never split across a page
        break, and colour retention (without print-color-adjust the plan badge and code panel
        print as white boxes).
      */}
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          .voucher-card, .voucher-list tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .voucher-card, .voucher-card * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .voucher-list thead { display: table-header-group; }
        }
      `}</style>
    </div>
  );
}
