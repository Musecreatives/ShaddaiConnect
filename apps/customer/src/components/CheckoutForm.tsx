'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ApiError, initializePayment, type Plan } from '@/lib/api';
import { subscribeToPaymentPush } from '@/lib/push';

export function CheckoutForm({ plan }: { plan: Plan }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deviceNote =
    plan.simultaneousUse === 1
      ? 'Works on 1 device at a time'
      : `Works on up to ${plan.simultaneousUse} devices at once`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await initializePayment({
        planId: plan.id,
        fullName: fullName.trim(),
        email: email.trim(),
        // Strip spaces/dashes people naturally type ("080 1234 5678") so the server's
        // digits-only check doesn't reject an otherwise valid number.
        phone: phone.replace(/[\s-]/g, ''),
        termsAccepted,
      });

      // Register this browser against the payment reference so an abandoned payment can be
      // nudged later (AbandonedPaymentService). Silent by default — it only registers if the
      // customer already granted notification permission, since prompting mid-purchase would
      // cost more sales than the nudge recovers. Never allowed to block the redirect.
      try {
        await subscribeToPaymentPush(result.reference);
      } catch {
        /* push is a nice-to-have; the purchase matters more */
      }

      window.location.href = result.authorizationUrl;
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong starting your payment. Check your connection and try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-ink">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="First and last name"
          autoComplete="name"
          // Mirrors the server-side rule so the browser catches it before a round trip.
          pattern="[A-Za-zÀ-ÿ'\-]{2,}(\s+[A-Za-zÀ-ÿ'\-]{2,})+"
          title="Enter your first and last name"
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
      </div>

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
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
        <p className="text-xs text-muted">Your voucher code and receipt go here.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08012345678"
          autoComplete="tel"
          inputMode="numeric"
          // Allows the spaces/dashes people type; they're stripped before submit.
          pattern="(0[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}|(\+?234)[\s-]?\d{10})"
          title="Enter a valid Nigerian phone number, e.g. 08012345678"
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
        <p className="text-xs text-muted">So we can reach you about this purchase.</p>
      </div>

      <ul className="flex flex-col gap-1.5 rounded-card bg-page p-4 text-xs text-muted">
        <li className="flex gap-2">
          <span className="text-brand-blue-deep">•</span>
          {deviceNote} — extra devices beyond that are refused automatically.
        </li>
        <li className="flex gap-2">
          <span className="text-brand-blue-deep">•</span>
          You&apos;re responsible for your own use of this connection.
        </li>
        <li className="flex gap-2">
          <span className="text-brand-blue-deep">•</span>
          No refunds once your code is issued.
        </li>
      </ul>

      <label className="flex items-start gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand-blue"
        />
        <span>
          I agree to the{' '}
          <Link href="/terms" target="_blank" className="text-brand-blue-deep underline">
            Terms &amp; Acceptable Use
          </Link>
          , including the no-sharing and liability terms above.
        </span>
      </label>

      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !termsAccepted}
        className="mt-1 w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-navy-2 disabled:opacity-35"
      >
        {submitting ? 'Starting payment…' : `Pay ₦${plan.priceNaira.toLocaleString('en-NG')}`}
      </button>
    </form>
  );
}
