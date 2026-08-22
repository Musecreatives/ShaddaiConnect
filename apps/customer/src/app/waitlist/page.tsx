import { BackLink } from '@/components/BackLink';
import { BuyShell } from '@/components/BuyShell';
import { WaitlistForm } from '@/components/WaitlistForm';

export const metadata = {
  title: 'Waitlist — Shaddai WiFi',
};

export default function WaitlistPage() {
  return (
    <BuyShell dark>
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 bg-page-dark p-6 lg:flex-none lg:rounded-2xl lg:border lg:border-white/10 lg:bg-white/[0.03] lg:p-8">
      <BackLink href="/" label="Back to plans" className="text-white/60 hover:text-white" />
      <div className="animate-fade-slide-in">
        <h1 className="font-display text-xl font-semibold text-white">Not in range yet?</h1>
        <p className="mt-1 text-sm text-white/70">
          Join the waitlist and tell us where you are — we&apos;ll email you as soon as Shaddai
          WiFi reaches your part of Ugbowo BDPA Estate.
        </p>
      </div>
      <div className="animate-fade-slide-in" style={{ animationDelay: '80ms' }}>
        <WaitlistForm />
      </div>
    </main>
    </BuyShell>
  );
}
