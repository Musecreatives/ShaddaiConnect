import Image from 'next/image';
import Link from 'next/link';
import { FaqAccordion } from '@/components/FaqAccordion';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { AUDIT_COVERS, FAQS } from '@/lib/landing-data';

export const metadata = { title: 'Free Review — Shaddai Communications' };

export default function AuditPage() {
  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <section className="bg-linear-to-b from-navy to-brand-blue px-6 py-22 sm:px-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 sm:grid-cols-2">
          <div>
            <h1 className="max-w-[18ch] font-display text-[clamp(2.2rem,5vw,3.6rem)] font-normal leading-[1.05] text-white">
              Your setup could do more. <em>Let&apos;s take a look.</em>
            </h1>
            <p className="mt-5 max-w-md font-sans text-lg leading-relaxed text-white/85">
              A free, no-obligation review of your networking, POS, software, or brand setup — returned as a plain-language summary.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-block rounded-full bg-white px-8 py-4 text-[15px] font-bold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              Start your free review
            </Link>
            <div className="mt-5 flex flex-wrap gap-6 font-sans text-sm font-semibold text-white/85">
              <span>No commitment</span>
              <span>Written summary within days</span>
            </div>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image
              src="/images/landing/cta-network.jpg"
              alt="Networking hardware Shaddai reviews as part of a free setup review"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#FBFCFD] px-6 py-22 dark:bg-page-dark sm:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="mb-3.5 text-center font-sans text-[clamp(1.5rem,2.6vw,2rem)] font-bold text-ink dark:text-white">
            What the review covers
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center font-sans text-[17px] leading-relaxed text-muted dark:text-white/55">
            Three areas, each producing findings you can act on with or without us.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {AUDIT_COVERS.map((a) => (
              <div key={a.title} className="rounded-frame border border-line bg-surface p-8 dark:border-line-dark dark:bg-surface-dark">
                <div className="mb-4 h-10 w-10 rounded-lg border border-line bg-[#E8F2F8] dark:border-line-dark dark:bg-page-dark" />
                <h3 className="mb-2.5 font-sans text-xl font-bold text-ink dark:text-white">{a.title}</h3>
                <p className="font-sans text-[15px] leading-relaxed text-muted dark:text-white/55">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-[#EAF2F6] px-6 py-22 dark:border-line-dark dark:bg-surface-dark sm:px-16">
        <div className="mx-auto w-full max-w-4xl">
          <h2 className="mb-9 font-sans text-[clamp(1.5rem,2.6vw,2rem)] font-bold text-ink dark:text-white">
            Frequently asked questions
          </h2>
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
