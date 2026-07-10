import Link from 'next/link';
import { PlanPicker } from '@/components/PlanPicker';
import { getPublicPlans } from '@/lib/api';

export default async function Home() {
  const plans = await getPublicPlans();

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Shaddai WiFi</h1>
        <p className="mt-1 text-sm text-muted">Pick a plan to get online.</p>
      </div>

      {plans.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          No plans are available right now. Please check back shortly.
        </p>
      ) : (
        <PlanPicker plans={plans} />
      )}

      <Link href="/check" className="text-center text-sm text-cyan-deep underline">
        Already bought a voucher? Check its status
      </Link>
    </main>
  );
}
