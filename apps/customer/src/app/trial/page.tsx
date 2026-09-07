import Link from 'next/link';
import { BackLink } from '@/components/BackLink';
import { BuyShell } from '@/components/BuyShell';
import { TrialClaimForm } from '@/components/TrialClaimForm';

/** Checked server-side on every load (never cached) so pausing the trial from the admin Plans
 * page takes effect immediately. Without this the form renders regardless and the customer only
 * discovers the trial is off after filling in their name, email, phone and location. */
export const dynamic = 'force-dynamic';

/** Server-rendered, so use the internal address — the public hostname would route out through
 * Cloudflare and back to reach an API running on this same host. See lib/api.ts. */
const API_BASE =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

async function isTrialAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/trial/availability`, { cache: 'no-store' });
    if (!res.ok) return true; // API hiccup shouldn't hide a trial that is actually running
    const data = (await res.json()) as { available: boolean };
    return data.available;
  } catch {
    return true;
  }
}

/** Admin-editable explanation for why the trial is off, from the Site Content admin page. */
async function trialPausedNote(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/site-settings`, { cache: 'no-store' });
    if (!res.ok) return '';
    const data = (await res.json()) as Record<string, string>;
    return data.trial_paused_note ?? '';
  } catch {
    return '';
  }
}

export default async function TrialPage() {
  const available = await isTrialAvailable();
  const pausedNote = available ? '' : await trialPausedNote();

  return (
    <BuyShell>
      <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6 lg:flex-none lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-8 lg:shadow-sm">
        <BackLink href="/" label="Back to plans" />
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Try it free</h1>
          <p className="mt-1 text-sm text-muted">
            {available
              ? '20 minutes on us — no card, no payment. Just enter your phone number.'
              : 'Our free trial is paused at the moment.'}
          </p>
        </div>

        {available ? (
          <TrialClaimForm />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-card border border-amber/30 bg-amber-tint px-4 py-3 text-sm leading-relaxed text-ink">
              {pausedNote ||
                'The free trial is temporarily unavailable while we work on coverage in the estate. Our paid plans are running as normal — they start from a few hundred naira.'}
            </div>
            <Link
              href="/"
              className="w-full rounded-btn bg-navy py-3.5 text-center text-[15px] font-bold text-white"
            >
              See our plans
            </Link>
            <Link
              href="/waitlist"
              className="w-full rounded-btn border-[1.5px] border-line py-3.5 text-center text-[15px] font-bold text-ink transition-colors hover:border-brand-blue"
            >
              Join the waitlist instead
            </Link>
          </div>
        )}
      </main>
    </BuyShell>
  );
}
