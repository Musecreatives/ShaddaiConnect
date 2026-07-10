import type { Plan } from './api';

/** DESIGN-SYSTEM.md §8 content rules: "30 minutes", "24 hours", "7 days". */
export function formatPlanDuration(plan: Plan): string {
  if (plan.planType === 'hourly' && plan.durationHours) {
    return plan.durationHours === 1 ? '1 hour' : `${plan.durationHours} hours`;
  }
  if (plan.planType === 'monthly' && plan.validityDays) {
    return plan.validityDays === 1 ? '1 day' : `${plan.validityDays} days`;
  }
  return plan.planType === 'monthly' ? 'Monthly' : 'One-time';
}

export function formatPlanMeta(plan: Plan): string {
  const device = plan.simultaneousUse === 1 ? '1 device' : `${plan.simultaneousUse} devices`;
  return `${formatPlanDuration(plan)} · ${device}`;
}

export function formatExpiry(expiresAt: string | null | undefined): string {
  if (!expiresAt) return 'No fixed expiry';
  const date = new Date(expiresAt);
  return `Expires ${date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  })}`;
}
