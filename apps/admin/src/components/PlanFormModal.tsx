'use client';

import { useState } from 'react';
import { ApiError, createPlan, updatePlan, type Plan } from '@/lib/api';

export function PlanFormModal({
  plan,
  onClose,
  onSaved,
}: {
  plan?: Plan;
  onClose: () => void;
  onSaved: (plan: Plan) => void;
}) {
  const [name, setName] = useState(plan?.name ?? '');
  const [planType, setPlanType] = useState<'hourly' | 'monthly'>(plan?.planType ?? 'hourly');
  const [priceNaira, setPriceNaira] = useState(plan?.priceNaira ?? 0);
  const [durationHours, setDurationHours] = useState(plan?.durationHours ?? 1);
  const [validityDays, setValidityDays] = useState(plan?.validityDays ?? 30);
  const [simultaneousUse, setSimultaneousUse] = useState(plan?.simultaneousUse ?? 1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const input = {
      name,
      planType,
      priceNaira,
      durationHours: planType === 'hourly' ? durationHours : undefined,
      validityDays: planType === 'monthly' ? validityDays : undefined,
      simultaneousUse,
    };
    try {
      const saved = plan ? await updatePlan(plan.id, input) : await createPlan(input);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save plan.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[440px] flex-col gap-4 rounded-frame bg-surface p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {plan ? 'Edit plan' : 'New plan'}
          </h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Type</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value as 'hourly' | 'monthly')}
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
            >
              <option value="hourly">Hourly</option>
              <option value="monthly">Monthly (Expiration-based)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Price (₦)</label>
            <input
              type="number"
              min={0}
              required
              value={priceNaira}
              onChange={(e) => setPriceNaira(Number(e.target.value))}
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {planType === 'hourly' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Duration (hours)</label>
              <input
                type="number"
                min={1}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Validity (days)</label>
              <input
                type="number"
                min={1}
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Device cap</label>
            <input
              type="number"
              min={1}
              value={simultaneousUse}
              onChange={(e) => setSimultaneousUse(Number(e.target.value))}
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
            />
          </div>
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
            disabled={submitting}
            className="flex-1 rounded-btn bg-navy py-3 text-[15px] font-bold text-white disabled:opacity-35"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
