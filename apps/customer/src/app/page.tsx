import Link from 'next/link';
import { PlanPicker } from '@/components/PlanPicker';
import { getPublicPlans } from '@/lib/api';

export default async function Home() {
  const plans = await getPublicPlans();

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-navy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 18.5C12.8 18.5 13.5 19.2 13.5 20C13.5 20.8 12.8 21.5 12 21.5C11.2 21.5 10.5 20.8 10.5 20C10.5 19.2 11.2 18.5 12 18.5Z"
              fill="#18C7D8"
            />
            <path
              d="M8.5 15.5C10.5 13.7 13.5 13.7 15.5 15.5"
              stroke="#18C7D8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M5 12C8.9 8.5 15.1 8.5 19 12"
              stroke="#18C7D8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M1.5 8.5C7 3.6 17 3.6 22.5 8.5"
              stroke="#18C7D8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
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
    </main>
  );
}
