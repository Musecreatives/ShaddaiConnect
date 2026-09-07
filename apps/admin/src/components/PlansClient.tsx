'use client';

import { useState } from 'react';
import { useConfirm, useToast } from '@/components/DialogProvider';
import { ApiError, deletePlan, updatePlan, type Plan } from '@/lib/api';
import { PlanFormModal } from './PlanFormModal';

function formatDuration(plan: Plan): string {
  if (plan.planType === 'hourly') return `${plan.durationHours ?? '—'} hours`;
  return `${plan.validityDays ?? '—'} days`;
}

export function PlansClient({ initialPlans }: { initialPlans: Plan[] }) {
  const confirmDialog = useConfirm();
  const toast = useToast();
  const [plans, setPlans] = useState(initialPlans);
  const [editing, setEditing] = useState<Plan | 'new' | null>(null);

  function handleSaved(saved: Plan) {
    setPlans((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
    setEditing(null);
  }

  async function toggleActive(plan: Plan) {
    const saved = await updatePlan(plan.id, { active: !plan.active });
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? saved : p)));
  }

  async function handleDelete(plan: Plan) {
    const ok = await confirmDialog(`Delete "${plan.name}"? This cannot be undone.`, {
      title: 'Delete plan',
      danger: true,
    });
    if (!ok) return;
    try {
      await deletePlan(plan.id);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    } catch (err) {
      // Most common case: the api rejects deletion because vouchers already reference this
      // plan (FK constraint) — its message already explains to deactivate instead.
      toast(err instanceof ApiError ? err.message : 'Failed to delete plan.');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Plans</h1>
          <p className="mt-1 text-sm text-muted">Prices and durations shown on the buy site.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-btn bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep"
        >
          + Add plan
        </button>
      </div>

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Device cap</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold text-ink">{plan.name}</td>
                <td className="px-4 py-3 capitalize text-muted">{plan.planType}</td>
                <td className="px-4 py-3 text-muted">{formatDuration(plan)}</td>
                <td className="px-4 py-3 font-mono">
                  ₦{plan.priceNaira.toLocaleString('en-NG')}
                </td>
                <td className="px-4 py-3 text-muted">{plan.simultaneousUse}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(plan)}
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${
                      plan.active ? 'bg-success-tint text-success' : 'bg-page text-muted'
                    }`}
                  >
                    {plan.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(plan)}
                      className="text-xs font-semibold text-brand-blue-deep"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plan)}
                      className="text-xs font-semibold text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <PlanFormModal
          plan={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
