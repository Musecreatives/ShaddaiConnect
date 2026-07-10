import { redirect } from 'next/navigation';
import Link from 'next/link';
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
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <Link href="/" className="text-sm text-cyan-deep underline">
        ← Back to plans
      </Link>

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
  );
}
