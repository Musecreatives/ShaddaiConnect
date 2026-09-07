import { ContactTabs } from '@/components/ContactTabs';
import { PlaceholderVisual } from '@/components/PlaceholderVisual';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata = { title: 'Contact — Shaddai Communications' };

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const SUPPORT_EMAIL = 'support@shaddaicommunications.com';
const DEFAULT_MESSAGE = "Hi, I'd like to talk to Shaddai Communications about a project.";

export default function ContactPage() {
  const encodedMessage = encodeURIComponent(DEFAULT_MESSAGE);

  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <section className="bg-linear-to-b from-navy to-brand-blue px-6 py-22 sm:px-16">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-normal leading-[1.05] text-white">
            Let&apos;s work together
          </h1>
          <p className="mt-4 max-w-xl font-sans text-lg leading-relaxed text-white/85">
            Tell us what you&apos;re working with — we&apos;ll get back to you with next steps and real pricing for your setup.
          </p>
        </div>
      </section>

      <section className="bg-page px-6 py-18 dark:bg-page-dark sm:px-16">
        <div className="mx-auto w-full max-w-3xl">
          <ContactTabs />

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`}
                className="flex flex-col gap-1 rounded-frame border border-line bg-surface p-6 transition-colors hover:border-brand-blue/40 dark:border-line-dark dark:bg-surface-dark"
              >
                <span className="font-sans text-base font-bold text-ink dark:text-white">WhatsApp</span>
                <span className="font-sans text-sm text-muted dark:text-white/50">Usually the fastest way to reach us.</span>
              </a>
            )}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodedMessage}`}
              className="flex flex-col gap-1 rounded-frame border border-line bg-surface p-6 transition-colors hover:border-brand-blue/40 dark:border-line-dark dark:bg-surface-dark"
            >
              <span className="font-sans text-base font-bold text-ink dark:text-white">Email</span>
              <span className="font-sans text-sm text-muted dark:text-white/50">{SUPPORT_EMAIL}</span>
            </a>
            <div className="flex flex-col gap-1 rounded-frame border border-line bg-surface p-6 dark:border-line-dark dark:bg-surface-dark">
              <span className="font-sans text-base font-bold text-ink dark:text-white">Base</span>
              <span className="font-sans text-sm text-muted dark:text-white/50">Ugbowo BDPA Estate, Benin City, Nigeria</span>
            </div>
          </div>

          <div className="mt-10 text-center">
            <PlaceholderVisual className="mx-auto mb-6 h-[280px] w-full rounded-frame" label="Map embed — pending" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
