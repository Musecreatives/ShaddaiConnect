import { BackLink } from '@/components/BackLink';
import { TrialClaimForm } from '@/components/TrialClaimForm';

export default function TrialPage() {
  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <BackLink href="/" label="Back to plans" />
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Try it free</h1>
        <p className="mt-1 text-sm text-muted">
          20 minutes on us — no card, no payment. Just enter your phone number.
        </p>
      </div>
      <TrialClaimForm />
    </main>
  );
}
