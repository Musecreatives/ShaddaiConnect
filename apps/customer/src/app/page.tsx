import Image from 'next/image';
import Link from 'next/link';
import { PlanPicker } from '@/components/PlanPicker';
import { getPublicPlans } from '@/lib/api';

export default async function Home() {
  const plans = await getPublicPlans();

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Shaddai WiFi" width={36} height={36} className="shrink-0" />
        <div>
          <div className="font-display text-[15px] font-bold text-ink">Shaddai WiFi</div>
          <div className="text-[11px] text-muted">Ugbowo BDPA Estate</div>
        </div>
      </div>

      <div>
        <div className="mb-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.09em] text-cyan-deep">
          Get online
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink">
          Pick a plan to start browsing
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Vouchers activate the moment payment clears. No app, no account.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          No plans are available right now. Please check back shortly.
        </p>
      ) : (
        <PlanPicker plans={plans} />
      )}

      <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Link
        href="/check"
        className="rounded-card border-[1.5px] border-dashed border-line px-4 py-3.5 text-center text-sm font-semibold text-ink transition-colors hover:border-cyan hover:text-cyan-deep"
      >
        Already have a voucher code? Check its status
      </Link>

      <div className="flex items-center justify-center gap-4 text-xs text-muted">
        <Link href="/business" className="underline hover:text-cyan-deep">
          For businesses
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/support" className="underline hover:text-cyan-deep">
          Support
        </Link>
      </div>
    </main>
  );
}
