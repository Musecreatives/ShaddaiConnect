'use client';

import { useState } from 'react';
import { useConfirm, useToast } from '@/components/DialogProvider';
import { ApiError, notifyPaymentGatewayIssue } from '@/lib/api';

/** Ad-hoc, one-off notice for a specific customer whose payment failed because of a known
 * issue on our end (e.g. the payment provider account pending verification) — distinct from
 * the automated "Nudge failed payments" button above, which tells everyone with a failed
 * payment to just try again. Doesn't require the customer to already be in the table: a failed
 * checkout may never have left a Customer row, so this sends straight to whatever email the
 * admin types in. */
export function PaymentGatewayIssueForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [planName, setPlanName] = useState('');
  const [sending, setSending] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    const ok = await confirm(`Send the payment-gateway-issue notice to ${email.trim()}?`, {
      title: 'Send email',
    });
    if (!ok) return;
    setSending(true);
    try {
      const { sent } = await notifyPaymentGatewayIssue({
        email: email.trim(),
        name: name.trim() || undefined,
        planName: planName.trim() || undefined,
      });
      toast(
        sent ? `Sent to ${email.trim()}.` : 'Logged but not sent — SENDGRID_API_KEY is not configured on the server.',
        sent ? 'success' : 'error',
      );
      if (sent) {
        setEmail('');
        setName('');
        setPlanName('');
        setOpen(false);
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to send.');
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-btn border border-line px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep"
      >
        Notify: payment gateway issue
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSend}
      className="flex w-full flex-col gap-2.5 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold text-muted">Customer email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          required
          className="w-full rounded-btn border-[1.5px] border-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold text-muted">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anna"
          className="w-full rounded-btn border-[1.5px] border-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold text-muted">Plan (optional)</label>
        <input
          type="text"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          placeholder="Weekly"
          className="w-full rounded-btn border-[1.5px] border-line px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="rounded-btn bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-40"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-btn border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand-blue"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
