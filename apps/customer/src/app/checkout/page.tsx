import { redirect } from 'next/navigation';
import { BackLink } from '@/components/BackLink';
import { BuyShell } from '@/components/BuyShell';
import { CheckoutForm } from '@/components/CheckoutForm';
import { getPublicPlans } from '@/lib/api';
import { formatPlanMeta } from '@/lib/format';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId } = await searchParams;
  if (!planId) redirect('/');

  const plans = await getPublicPlans();
  const plan = plans.find((p) => p.id === Number(planId));
  if (!plan) redirect('/');

  return (
    <BuyShell>
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6 lg:flex-none lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-8 lg:shadow-sm">
      <BackLink href="/" label="Back to plans" />

      <div className="rounded-card bg-page p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-display font-semibold text-ink">{plan.name}</span>
          <span className="font-mono font-bold text-ink">
            ₦{plan.priceNaira.toLocaleString('en-NG')}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{formatPlanMeta(plan)}</p>
      </div>

      <CheckoutForm plan={plan} />
    </main>
    </BuyShell>
  );
}
