import Image from 'next/image';
import Link from 'next/link';
import { BuyShell } from '@/components/BuyShell';
import { PlanPicker } from '@/components/PlanPicker';
import { getPublicPlans, getSiteSettings } from '@/lib/api';

export default async function Home() {
  // Server Component fetch — if the API is briefly unreachable (cold start after a deploy,
  // network blip), fail soft into an inline message instead of throwing and triggering Next's
  // generic full-page crash screen (no custom error.tsx existed for this before).
  // Fetched in parallel, not sequentially — these don't depend on each other, and awaiting them
  // one after the other doubled the page's render time. Each settles independently so a failure
  // in one can't blank the other (a missing banner is invisible; a missing plan list isn't).
  const [plansResult, settingsResult] = await Promise.allSettled([
    getPublicPlans(),
    getSiteSettings(),
  ]);

  const plansFailed = plansResult.status === 'rejected';
  const plans = plansResult.status === 'fulfilled' ? plansResult.value : [];
  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : {};
  const announcement = settings.announcement ?? '';
  const coverageNote = settings.coverage_note ?? '';

  return (
    <BuyShell>
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6 lg:max-w-xl lg:flex-none lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-9 lg:shadow-sm">
      <a
        href="https://shaddaicommunications.com"
        className="animate-fade-slide-in flex items-center gap-3 lg:hidden"
      >
        <Image src="/logo.png" alt="Shaddai WiFi" width={36} height={36} className="shrink-0" />
        <div>
          <div className="font-display text-[15px] font-bold text-ink">Shaddai WiFi</div>
          <div className="text-[11px] text-muted">Ugbowo BDPA Estate</div>
        </div>
      </a>

      {announcement && (
        <div
          className="animate-fade-slide-in rounded-card border border-amber/30 bg-amber-tint px-4 py-3 text-sm leading-relaxed text-ink"
          style={{ animationDelay: '20ms' }}
        >
          {announcement}
        </div>
      )}

      <div className="animate-fade-slide-in" style={{ animationDelay: '40ms' }}>
        <div className="mb-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-blue-deep">
          Get online
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink">
          Pick a plan to start browsing
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Vouchers activate the moment payment clears. No app, no account.
        </p>
      </div>

      {plansFailed ? (
        <p className="rounded-card border border-danger/30 bg-danger-tint p-4 text-sm text-danger">
          Couldn&apos;t load plans right now — please refresh the page.
        </p>
      ) : plans.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          No plans are available right now. Please check back shortly.
        </p>
      ) : (
        <PlanPicker plans={plans} />
      )}

      {coverageNote && (
        <p className="rounded-card border border-line bg-page px-4 py-3 text-[12.5px] leading-relaxed text-muted">
          {coverageNote}
        </p>
      )}

      <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Link
        href="/trial"
        className="rounded-card border-[1.5px] border-dashed border-brand-blue/50 bg-brand-blue/5 px-4 py-3.5 text-center text-sm font-semibold text-brand-blue-deep transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-blue"
      >
        First time here? Try 20 minutes free
      </Link>

      <Link
        href="/check"
        className="rounded-card border-[1.5px] border-dashed border-line px-4 py-3.5 text-center text-sm font-semibold text-ink transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-blue hover:text-brand-blue-deep"
      >
        Already have a voucher code? Check its status
      </Link>

      <div className="flex items-center justify-center gap-4 text-xs text-muted">
        <Link href="/business" className="underline hover:text-brand-blue-deep">
          For businesses
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/waitlist" className="underline hover:text-brand-blue-deep">
          Not in range? Join waitlist
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/support" className="underline hover:text-brand-blue-deep">
          Support
        </Link>
      </div>
    </main>
    </BuyShell>
  );
}
