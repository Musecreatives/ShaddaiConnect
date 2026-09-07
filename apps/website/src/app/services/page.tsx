import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { PROCESS, SERVICES } from '@/lib/landing-data';

export const metadata = { title: 'Services — Shaddai Communications' };

export default function ServicesIndexPage() {
  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <section className="bg-linear-to-b from-navy to-brand-blue px-6 py-24 sm:px-16">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="max-w-[20ch] font-display text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[1.02] text-white">
            Everything your home and business runs on.
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-[clamp(1.05rem,1.6vw,1.3rem)] leading-relaxed text-white/85">
            Six things we do, described in the order most people ask about them.
          </p>
        </div>
      </section>

      <section className="bg-[#FBFCFD] px-6 py-22 dark:bg-page-dark sm:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          {SERVICES.map((service) => (
            <div
              key={service.slug}
              className="grid grid-cols-1 gap-8 border-b border-line py-14 first:pt-0 last:border-0 dark:border-line-dark sm:grid-cols-[auto_1fr] sm:items-start"
            >
              <div className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.8] text-brand-blue-light/40 dark:text-white/10">
                {service.num}
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal leading-[1.08] text-ink dark:text-white">
                  {service.title}
                </h2>
                <p className="mt-3.5 max-w-2xl font-sans text-lg leading-relaxed text-muted dark:text-white/55">
                  {service.long}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {service.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-line bg-surface px-4 py-3.5 font-sans text-[15px] font-semibold text-ink dark:border-line-dark dark:bg-surface-dark dark:text-white/85"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <Link
                  href={`/services/${service.slug}`}
                  className="mt-6 inline-block font-sans text-sm font-bold text-brand-blue hover:text-navy dark:hover:text-white"
                >
                  More on {service.title} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-page px-6 py-24 dark:border-line-dark dark:bg-page-dark sm:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-normal leading-[1.1] text-ink dark:text-white">
            Our process
          </h2>
          <p className="mt-3 max-w-xl font-sans text-[17px] leading-relaxed text-muted dark:text-white/55">
            Four stages, each with a defined output you can review before the next begins.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step) => (
              <div key={step.name} className="border-t-2 border-brand-blue pt-6">
                <div className="mb-3.5 font-display text-6xl leading-[0.9] text-ink dark:text-white">{step.letter}</div>
                <div className="mb-3.5 inline-block rounded-full bg-navy px-4 py-2 font-sans text-[13px] font-bold text-white">
                  {step.name}
                </div>
                <p className="font-sans text-[15px] leading-relaxed text-muted dark:text-white/55">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
