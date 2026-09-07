import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { JOBS } from '@/lib/landing-data';

export const metadata = { title: 'Careers — Shaddai Communications' };

export default function CareersPage() {
  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <section className="bg-navy px-6 py-22 sm:px-16">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-normal leading-[1.05] text-white">
            Build with us
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-lg leading-relaxed text-white/55">
            We take on technicians, developers, designers, and tutors who prefer direct client
            work over a call-centre structure.
          </p>
        </div>
      </section>

      <section className="bg-page px-6 py-18 dark:bg-page-dark sm:px-16">
        <div className="mx-auto w-full max-w-3xl">
          {JOBS.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {JOBS.map((j) => (
                <div
                  key={j.title}
                  className="grid grid-cols-1 items-center gap-5 rounded-frame border border-line bg-surface p-7 dark:border-line-dark dark:bg-surface-dark sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <h3 className="mb-1.5 font-sans text-xl font-bold text-ink dark:text-white">{j.title}</h3>
                    <div className="font-sans text-sm text-muted dark:text-white/50">{j.meta}</div>
                  </div>
                  <Link
                    href="/contact"
                    className="justify-self-start rounded-full border border-navy px-6 py-3.5 font-sans text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-navy sm:justify-self-end"
                  >
                    Apply
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-frame border border-line bg-surface p-12 text-center dark:border-line-dark dark:bg-surface-dark">
              <p className="font-sans text-lg leading-relaxed text-muted dark:text-white/55">
                No open roles right now.
              </p>
            </div>
          )}

          <div className="mt-9 rounded-frame bg-[#EAF2F6] p-9 text-center dark:bg-surface-dark">
            <p className="mb-5 max-w-lg mx-auto font-sans text-lg leading-relaxed text-ink dark:text-white/80">
              Nothing open that matches what you do? We also work with freelance collaborators on a project basis.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-full bg-navy px-8 py-4 font-sans text-[15px] font-bold text-white transition-colors hover:bg-brand-blue"
            >
              Join the talent pool
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
