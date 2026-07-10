'use client';

import { useState } from 'react';
import { ApiError, initializePayment, type Plan } from '@/lib/api';

export function CheckoutForm({ plan }: { plan: Plan }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await initializePayment({ planId: plan.id, email, phone: phone || undefined });
      window.location.href = result.authorizationUrl;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong starting your payment. Check your connection and try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
        />
        <p className="text-xs text-muted">Your voucher code and receipt go here.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          Phone <span className="text-muted">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="080X XXX XXXX"
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
        />
      </div>

      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-navy-2 disabled:opacity-35"
      >
        {submitting ? 'Starting payment…' : `Pay ₦${plan.priceNaira.toLocaleString('en-NG')}`}
      </button>
    </form>
  );
}
