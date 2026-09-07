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
  // Blank string, not 0 — these three are genuinely optional and "" means "no limit". Storing 0
  // would be a real limit of zero, and the API treats null/undefined as unlimited.
  const [bandwidthDownKbps, setBandwidthDownKbps] = useState(
    plan?.bandwidthDownKbps != null ? String(plan.bandwidthDownKbps) : '',
  );
  const [bandwidthUpKbps, setBandwidthUpKbps] = useState(
    plan?.bandwidthUpKbps != null ? String(plan.bandwidthUpKbps) : '',
  );
  const [dataCapMb, setDataCapMb] = useState(plan?.dataCapMb != null ? String(plan.dataCapMb) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionalNumber = (v: string): number | undefined => {
    const trimmed = v.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

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
      bandwidthDownKbps: optionalNumber(bandwidthDownKbps),
      bandwidthUpKbps: optionalNumber(bandwidthUpKbps),
      dataCapMb: optionalNumber(dataCapMb),
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
        className="flex max-h-[90vh] w-full max-w-[440px] flex-col gap-4 overflow-y-auto rounded-frame bg-surface p-6"
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
            className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Type</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value as 'hourly' | 'monthly')}
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
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
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
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
                className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
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
                className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
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
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Speed limits are enforced by pfSense's traffic shaper from the WISPr-Bandwidth-Max-*
            radreply attributes written at issuance — unlike a CoA-based change, this genuinely
            works. Applies to vouchers issued *after* the change; existing ones keep the values
            they were issued with. */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-ink">Speed limit</label>
            <span className="text-[11px] text-muted">Leave blank for unlimited</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={1}
              placeholder="Download Kbps"
              value={bandwidthDownKbps}
              onChange={(e) => setBandwidthDownKbps(e.target.value)}
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
            />
            <input
              type="number"
              min={1}
              placeholder="Upload Kbps"
              value={bandwidthUpKbps}
              onChange={(e) => setBandwidthUpKbps(e.target.value)}
              className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
            />
          </div>
          <p className="text-[11px] text-muted">e.g. 2000 = 2 Mbps. Applies to new vouchers only.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-ink">Data cap (MB)</label>
            <span className="text-[11px] text-muted">Leave blank for unlimited</span>
          </div>
          <input
            type="number"
            min={1}
            placeholder="No cap"
            value={dataCapMb}
            onChange={(e) => setDataCapMb(e.target.value)}
            className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
          />
          <p className="text-[11px] text-muted">
            Voucher is expired and the device disconnected once total usage passes this.
          </p>
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
            className="flex-1 rounded-btn bg-brand-blue py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-35"
          >
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
