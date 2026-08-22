'use client';

import { useState } from 'react';
import { ApiError, createVouchers, type Plan, type Voucher } from '@/lib/api';

export function CreateVoucherModal({
  plans,
  onClose,
  onCreated,
}: {
  plans: Plan[];
  onClose: () => void;
  onCreated: (vouchers: Voucher[]) => void;
}) {
  const [planId, setPlanId] = useState<number | ''>(plans[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createVouchers({ planId, quantity });
      const vouchers = Array.isArray(result) ? result : [result];
      onCreated(vouchers);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create vouchers.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[420px] flex-col gap-4 rounded-frame bg-surface p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">New voucher batch</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Plan</label>
          <select
            value={planId}
            onChange={(e) => setPlanId(Number(e.target.value))}
            className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — ₦{plan.priceNaira.toLocaleString('en-NG')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Quantity</label>
          <input
            type="number"
            min={1}
            max={500}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
          />
        </div>

        {error && (
          <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-btn border-[1.5px] border-line py-3 text-[15px] font-bold text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !planId}
            className="flex-1 rounded-btn bg-brand-blue py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-35"
          >
            {submitting ? 'Creating…' : `Create ${quantity > 1 ? quantity : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
}
