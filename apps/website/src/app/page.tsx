import Link from 'next/link';
import { FaqAccordion } from '@/components/FaqAccordion';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { WaitlistForm } from '@/components/WaitlistForm';
import { getPublicPlans, type Plan } from '@/lib/api';
import { formatPlanMeta } from '@/lib/format';
import { COVERAGE_AREAS, COVERAGE_LANDMARKS } from '@/lib/coverage';

const BUY_URL = process.env.NEXT_PUBLIC_BUY_URL ?? 'https://buy.shaddaicommunications.com';

const SERVICES = [
  { slug: 'wifi', title: 'Community WiFi' },
  { slug: 'starlink', title: 'Starlink Installation' },
  { slug: 'cctv', title: 'CCTV Installation' },
  { slug: 'brand-identity', title: 'Brand Identity' },
  { slug: 'website-development', title: 'Website Development' },
  { slug: 'software-development', title: 'Software Development' },
  { slug: 'pos', title: 'POS & Business Tools' },
];

const STEPS = [
  { title: 'Tell us what you need', body: 'WiFi, a website, CCTV, custom software — pick a service and reach out.' },
  { title: 'We scope it for your setup', body: 'A quick chat or site visit, then real pricing — no guessing, no surprises.' },
  { title: 'We deliver, locally', body: 'One local team you can actually reach, not a call centre in another city.' },
];

export default async function Home() {
  let plans: Plan[] = [];
  try {
    plans = (await getPublicPlans()).filter((p) => p.active);
  } catch {
    plans = [];
  }
  const previewPlans = plans.slice(0, 3);

  return (
    <main className="flex flex-1 flex-col bg-page-dark text-white">
      <SiteHeader />

      {/* Hero — massive type with side stats, per 1c */}
      <section className="grid gap-12 px-6 py-20 sm:grid-cols-[1fr_auto] sm:items-end sm:px-16 sm:py-28">
        <div>
          <div className="mb-6 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Live in Ugbowo BDPA Estate
          </div>
          <h1 className="max-w-xl font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl">
            Everything your home and business runs on.
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-white/45">
            WiFi, satellite internet, CCTV, and the digital tools you need — one local team, no
            contracts, no runaround.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="rounded-btn bg-brand-blue px-8 py-4 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep"
            >
              See all services →
            </Link>
            <a
              href={BUY_URL}
              className="rounded-btn border border-line-dark px-8 py-4 text-[15px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              Buy a WiFi voucher
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-6 pb-1">
          <div className="border-l-2 border-brand-blue pl-5">
            <div className="font-mono text-2xl font-bold text-white">7</div>
            <div className="mt-0.5 text-xs text-white/35">services offered</div>
          </div>
          <div className="border-l-2 border-brand-blue/40 pl-5">
            <div className="font-mono text-2xl font-bold text-white">1</div>
            <div className="mt-0.5 text-xs text-white/35">local team</div>
          </div>
          <div className="border-l-2 border-brand-blue/20 pl-5">
            <div className="font-mono text-2xl font-bold text-white">0</div>
            <div className="mt-0.5 text-xs text-white/35">contracts</div>
          </div>
        </div>
      </section>

      {/* Coverage strip */}
      <div className="px-6 pb-16 sm:px-16">
        <div className="flex flex-wrap items-center gap-3 rounded-frame border border-line-dark bg-surface-dark px-6 py-5">
          <span className="font-mono text-xs uppercase tracking-wide text-white/35">WiFi live on:</span>
          {[...COVERAGE_AREAS, ...COVERAGE_LANDMARKS].map((area) => (
            <span key={area} className="rounded-btn bg-brand-blue/10 px-3 py-1 text-sm font-medium text-brand-blue-light">
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <section id="services" className="scroll-mt-6 border-t border-line-dark px-6 py-16 sm:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue-light">
                What we do
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">Seven ways we keep you running</h2>
            </div>
            <Link href="/services" className="hidden text-sm font-semibold text-brand-blue-light hover:text-white sm:inline">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group flex items-center justify-between rounded-frame border border-line-dark bg-surface-dark p-6 transition-colors hover:border-brand-blue/40"
              >
                <span className="font-display text-base font-semibold text-white">{service.title}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-brand-blue-light"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — numbered rows */}
      <section className="border-t border-line-dark px-6 py-16 sm:px-16">
        <div className="mx-auto w-full max-w-3xl">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue-light">
            How it works
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">Simple, whichever service you need</h2>
          <div className="mt-8 flex flex-col">
            {STEPS.map((step, i) => (
              <div key={step.title} className="grid grid-cols-[48px_1fr] gap-5 border-t border-line-dark py-7 last:border-b sm:grid-cols-[60px_1fr_1fr]">
                <span className="font-mono text-sm font-bold text-brand-blue">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-lg font-bold text-white">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-white/45">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WiFi pricing */}
      {previewPlans.length > 0 && (
        <section id="pricing" className="scroll-mt-6 border-t border-line-dark px-6 py-16 sm:px-16">
          <div className="mx-auto w-full max-w-3xl">
            <div className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue-light">
              Community WiFi
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">What it&apos;ll cost</h2>
            <p className="mt-1 text-[15px] text-white/45">Real pricing, no surprises.</p>
            <div className="mt-8 grid gap-px overflow-hidden rounded-frame bg-line-dark sm:grid-cols-3">
              {previewPlans.map((plan, i) => {
                const popular = previewPlans.length > 1 && i === 1;
                return (
                  <div key={plan.id} className={`relative flex flex-col p-7 ${popular ? 'bg-navy' : 'bg-page-dark'}`}>
                    {popular && <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-blue" />}
                    <h3 className={`font-display text-lg font-bold ${popular ? 'text-brand-blue-light' : 'text-white'}`}>
                      {plan.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-white/35">{formatPlanMeta(plan)}</p>
                    <div className={`mt-5 font-mono text-3xl font-bold ${popular ? 'text-brand-blue-light' : 'text-white'}`}>
                      ₦{plan.priceNaira.toLocaleString('en-NG')}
                    </div>
                    <a
                      href={BUY_URL}
                      className={`mt-auto pt-6 text-center text-sm font-bold ${
                        popular
                          ? 'rounded-btn bg-brand-blue py-3 text-white hover:bg-brand-blue-deep'
                          : 'rounded-btn border border-line-dark py-3 text-white/60 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      Buy now
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Waitlist */}
      <section className="border-t border-line-dark px-6 py-16 sm:px-16">
        <div className="mx-auto w-full max-w-md text-center">
          <h2 className="font-display text-2xl font-bold text-white">Not in a WiFi-covered area yet?</h2>
          <p className="mt-2 text-[15px] text-white/45">
            Join the waitlist — we&apos;ll email you the moment we reach your street.
          </p>
          <div className="mt-6 text-left">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-6 border-t border-line-dark px-6 py-16 sm:px-16">
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="text-center font-display text-2xl font-bold text-white">Frequently asked questions</h2>
          <div className="mt-8">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
