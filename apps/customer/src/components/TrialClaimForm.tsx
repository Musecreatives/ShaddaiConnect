'use client';

import { Ticket } from '@shaddai/ui';
import { useState } from 'react';
import { ApiError, claimTrial } from '@/lib/api';
import { VoucherQr } from './VoucherQr';

export function TrialClaimForm() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await claimTrial(phone.trim());
      setCode(result.code);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "This phone number has already claimed a free trial — one per customer, but you're welcome to buy a plan below."
          : err instanceof ApiError
            ? err.message
            : 'Something went wrong claiming your trial. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (code) {
    return (
      <div className="flex flex-col gap-5">
        <Ticket
          code={code}
          planLabel="Free Trial"
          expiryLabel="20 minutes once you connect"
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          required
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white disabled:opacity-35"
        >
          {loading ? 'Claiming…' : 'Get my free 20 minutes'}
        </button>
      </form>
      <p className="text-xs text-muted">
        One free trial per phone number. Same coverage rules apply — make sure you can see
        &quot;Shaddai WiFi&quot; on your device first.
      </p>
      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
