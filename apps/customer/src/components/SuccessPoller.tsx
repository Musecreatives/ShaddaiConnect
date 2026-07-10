'use client';

import { Ticket } from '@shaddai/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPaymentStatus, type PaymentStatus } from '@/lib/api';
import { formatExpiry } from '@/lib/format';
import { VoucherQr } from './VoucherQr';

const POLL_INTERVAL_MS = 2500;

export function SuccessPoller({ reference }: { reference: string }) {
  const [status, setStatus] = useState<PaymentStatus>({ reference, status: 'pending' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const result = await getPaymentStatus(reference);
        if (cancelled) return;
        setStatus(result);
        if (result.status === 'pending') {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reference]);

  if (status.status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-cyan" />
        <p className="text-sm text-muted">Confirming your payment…</p>
      </div>
    );
  }

  if (status.status === 'failed') {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="font-display text-lg font-semibold text-ink">That payment didn't go through</p>
        <p className="text-sm text-muted">
          You haven't been charged for a voucher. Check your card details and try again.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-btn bg-navy px-5 py-3 text-[15px] font-bold text-white"
        >
          Back to plans
        </Link>
      </div>
    );
  }

  const code = status.voucherCode!;

  return (
    <div className="flex flex-col gap-5">
      <Ticket
        code={code}
        planLabel={status.planName ?? ''}
        expiryLabel={formatExpiry(status.expiresAt)}
        qrSlot={<VoucherQr value={code} />}
      />

      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="w-full rounded-btn border-[1.5px] border-line py-3 text-[15px] font-bold text-ink transition-colors hover:border-cyan"
      >
        {copied ? 'Copied!' : 'Copy code'}
      </button>

      <div className="rounded-card bg-page p-4">
        <p className="mb-2 font-display text-sm font-semibold text-ink">How to connect</p>
        <ol className="list-decimal space-y-1 pl-4 text-sm text-muted">
          <li>Join the Shaddai WiFi network.</li>
          <li>Open your browser — the login page appears automatically.</li>
          <li>Enter this code, or scan the QR above.</li>
          <li>You're online.</li>
        </ol>
      </div>
    </div>
  );
}
