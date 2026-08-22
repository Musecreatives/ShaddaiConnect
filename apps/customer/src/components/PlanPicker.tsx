'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PlanCard } from '@shaddai/ui';
import type { Plan } from '@/lib/api';
import { formatPlanMeta } from '@/lib/format';
import { CoverageNotice } from './CoverageNotice';

export function PlanPicker({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [coverageConfirmed, setCoverageConfirmed] = useState(false);

  // No "popular" field on Plan yet — nudging toward the monthly plan is a reasonable default
  // for a WISP business (recurring revenue) until this is admin-configurable.
  const popularId = plans.find((p) => p.planType === 'monthly')?.id;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2">
        {plans.map((plan, i) => (
          <div key={plan.id} className="animate-fade-slide-in" style={{ animationDelay: `${i * 60}ms` }}>
            <PlanCard
              name={plan.name}
              meta={formatPlanMeta(plan)}
              priceNaira={plan.priceNaira}
              selected={plan.id === selectedId}
              popular={plan.id === popularId}
              onSelect={() => setSelectedId(plan.id)}
            />
          </div>
        ))}
      </div>

      <CoverageNotice confirmed={coverageConfirmed} onChange={setCoverageConfirmed} />

      <button
        type="button"
        disabled={selectedId === null || !coverageConfirmed}
        onClick={() => selectedId !== null && router.push(`/checkout?planId=${selectedId}`)}
        className="mt-2 w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-navy-2 disabled:opacity-35 disabled:hover:translate-y-0"
      >
        Continue
      </button>
    </div>
  );
}
