'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PlanCard } from '@shaddai/ui';
import type { Plan } from '@/lib/api';
import { formatPlanMeta } from '@/lib/format';

export function PlanPicker({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // No "popular" field on Plan yet — nudging toward the monthly plan is a reasonable default
  // for a WISP business (recurring revenue) until this is admin-configurable.
  const popularId = plans.find((p) => p.planType === 'monthly')?.id;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            meta={formatPlanMeta(plan)}
            priceNaira={plan.priceNaira}
            selected={plan.id === selectedId}
            popular={plan.id === popularId}
            onSelect={() => setSelectedId(plan.id)}
          />
        ))}
      </div>
      <button
        type="button"
        disabled={selectedId === null}
        onClick={() => selectedId !== null && router.push(`/checkout?planId=${selectedId}`)}
        className="mt-2 w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-navy-2 disabled:opacity-35"
      >
        Continue
      </button>
    </div>
  );
}
