import Image from 'next/image';
import { FaqAccordion } from '@/components/FaqAccordion';
import { StarlinkPromo } from '@/components/StarlinkPromo';
import { WaitlistForm } from '@/components/WaitlistForm';
import { getPublicPlans, type Plan } from '@/lib/api';
import { formatPlanMeta } from '@/lib/format';
import { COVERAGE_AREAS, COVERAGE_LANDMARKS } from '@/lib/coverage';

const BUY_URL = process.env.NEXT_PUBLIC_BUY_URL ?? 'https://buy.shaddaicommunications.com';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const SUPPORT_EMAIL = 'support@shaddaicommunications.com';

const SERVICES = [
  {
    title: 'Website design & development',
    body: 'A professional website for your shop, school, or business — built and hosted for you, no technical know-how needed.',
    quoteMessage: "Hi, I'd like a quote for a website for my business.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9H21" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="6.5" cy="6.5" r="0.75" fill="currentColor" />
        <circle cx="9" cy="6.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Point of Sale (POS) portal',
    body: 'A simple digital till for tracking sales, stock, and daily takings — built for shops and small businesses around the estate.',
    quoteMessage: "Hi, I'd like a quote for a POS portal for my business.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 21H15M12 15V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 8H16M8 11H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    title: 'Join the waitlist',
    body: 'Tell us your street or nearest landmark — takes ten seconds.',
  },
  {
    title: 'We reach your street',
    body: "We're expanding block by block. You'll get an email the moment we're live near you.",
  },
  {
    title: 'Buy a voucher & connect',
    body: "Grab a time-based voucher, enter the code on the WiFi login page, and you're online.",
  },
];

const WHY = [
  {
    title: 'Pay as you go',
    body: 'Hourly and monthly vouchers — pay only for the time you need, no lock-in contract.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10H21" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="14.5" r="1.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Instant activation',
    body: 'Vouchers activate the moment payment clears. No app to install, no account to create.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4 14H11L10 22L20 9H13L13 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Built for the estate',
    body: 'A local community network, not a national ISP — support that actually knows your street.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21C16 17 19 13.4 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 13.4 8 17 12 21Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
];

export default async function Home() {
  // Server Component fetch — real plan pricing on a marketing page beats hardcoded numbers that
  // drift out of date, but this page must still render fine if the API is briefly unreachable.
  let plans: Plan[] = [];
  try {
    plans = (await getPublicPlans()).filter((p) => p.active);
  } catch {
    plans = [];
  }
  const previewPlans = plans.slice(0, 3);

  return (
    <main className="flex flex-1 flex-col">
      <div className="bg-page-dark">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 pb-4 pt-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Shaddai Communications" width={40} height={40} className="shrink-0" />
            <div>
              <div className="font-display text-[15px] font-bold text-white">Shaddai Communications</div>
              <div className="text-[11px] text-white/60">Ugbowo BDPA Estate, Benin City</div>
            </div>
          </div>
        </div>

        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-10 text-center sm:py-16">
          <div className="animate-fade-slide-in flex flex-col items-center gap-4">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.09em] text-brand-blue-light">
              We&apos;re live
            </div>
            <h1 className="max-w-2xl font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Fast, affordable community WiFi for Ugbowo BDPA Estate
            </h1>
            <p className="max-w-xl text-[15px] text-white/70 sm:text-base">
              Shaddai Comm Ventures WiFi is live — no contracts, no fibre wait, just a voucher
              code and you&apos;re online. Buy a voucher now if you&apos;re in a covered area, or
              join the waitlist so we can email you the moment we reach your street.
            </p>
            <p className="max-w-xl text-xs text-white/50">
              Currently live on <strong className="text-white/80">{COVERAGE_AREAS.join(', ')}</strong>
              , and near <strong className="text-white/80">{COVERAGE_LANDMARKS.join(', ')}</strong>.
            </p>
          </div>

          <a
            href={BUY_URL}
            className="animate-fade-slide-in rounded-btn bg-brand-blue px-7 py-4 text-[15px] font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-blue-deep"
            style={{ animationDelay: '40ms' }}
          >
            Buy a voucher now →
          </a>

          <div className="animate-fade-slide-in w-full max-w-lg" style={{ animationDelay: '80ms' }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-white/50">
              Not in a covered area yet? Join the waitlist
            </p>
            <WaitlistForm />
          </div>
        </section>
      </div>

      <section className="border-t border-line bg-surface py-12">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="animate-fade-slide-in flex flex-col gap-2 rounded-card border border-line bg-page p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-8px_rgba(46,117,196,.25)]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.09em] text-brand-blue-deep">
                Step {i + 1}
              </div>
              <div className="font-display text-base font-semibold text-ink">{step.title}</div>
              <p className="text-sm text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {previewPlans.length > 0 && (
        <section className="border-t border-line bg-page py-12">
          <div className="mx-auto w-full max-w-5xl px-6 text-center">
            <h2 className="font-display text-xl font-semibold text-ink">What it&apos;ll cost</h2>
            <p className="mt-1 text-sm text-muted">
              Real pricing, no surprises — pick what fits and buy a voucher today.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {previewPlans.map((plan, i) => (
                <div
                  key={plan.id}
                  className="animate-fade-slide-in rounded-card border-[1.5px] border-line bg-surface p-5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-blue hover:shadow-[0_6px_16px_-8px_rgba(46,117,196,.3)]"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="font-display text-base font-semibold text-ink">{plan.name}</div>
                  <div className="mt-0.5 text-xs text-muted">{formatPlanMeta(plan)}</div>
                  <div className="mt-3 font-mono text-2xl font-bold text-brand-blue-deep">
                    ₦{plan.priceNaira.toLocaleString('en-NG')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-surface py-12">
        <div className="mx-auto w-full max-w-5xl px-6 text-center">
          <h2 className="font-display text-xl font-semibold text-ink">Why Shaddai WiFi</h2>
          <div className="mt-8 grid gap-5 text-left sm:grid-cols-3">
            {WHY.map((item, i) => (
              <div
                key={item.title}
                className="animate-fade-slide-in rounded-card border border-line bg-page p-5 transition-all duration-150 hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light/20 text-brand-blue-deep">
                  {item.icon}
                </div>
                <div className="font-display text-sm font-semibold text-ink">{item.title}</div>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StarlinkPromo />

      <section className="border-t border-line bg-surface py-12">
        <div className="mx-auto w-full max-w-5xl px-6 text-center">
          <h2 className="font-display text-xl font-semibold text-ink">Other ways we can help</h2>
          <p className="mt-1 text-sm text-muted">
            Beyond WiFi — services for shops and small businesses around the estate.
          </p>
          <div className="mt-8 grid gap-5 text-left sm:grid-cols-2">
            {SERVICES.map((service, i) => {
              const encodedMessage = encodeURIComponent(service.quoteMessage);
              return (
                <div
                  key={service.title}
                  className="animate-fade-slide-in rounded-card border border-line bg-page p-5 transition-all duration-150 hover:-translate-y-0.5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light/20 text-brand-blue-deep">
                    {service.icon}
                  </div>
                  <div className="font-display text-sm font-semibold text-ink">{service.title}</div>
                  <p className="mt-1 text-sm text-muted">{service.body}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                    {WHATSAPP_NUMBER && (
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`}
                        className="text-brand-blue-deep underline underline-offset-2 hover:text-ink"
                      >
                        WhatsApp us
                      </a>
                    )}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}?subject=${encodedMessage}`}
                      className="text-brand-blue-deep underline underline-offset-2 hover:text-ink"
                    >
                      Get a quote
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-page py-12">
        <div className="mx-auto w-full max-w-2xl px-6">
          <h2 className="text-center font-display text-xl font-semibold text-ink">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-line bg-surface py-10">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Shaddai Communications" width={24} height={24} />
              <span className="font-display text-sm font-bold text-ink">Shaddai Communications</span>
            </div>
            <p className="mt-2 text-xs text-muted">Ugbowo BDPA Estate, Benin City</p>
          </div>
          <div>
            <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-muted">
              Navigation
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-ink">
              <a href={BUY_URL} className="hover:text-brand-blue-deep">Buy a voucher</a>
              <a href="/#faq" className="hover:text-brand-blue-deep">FAQ</a>
            </div>
          </div>
          <div>
            <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-muted">
              Company
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-ink">
              <a href={`${BUY_URL}/business`} className="hover:text-brand-blue-deep">For businesses</a>
              <a href={`${BUY_URL}/terms`} className="hover:text-brand-blue-deep">Terms</a>
            </div>
          </div>
          <div>
            <div className="mb-2 font-mono text-[10.5px] font-bold uppercase tracking-wide text-muted">
              Talk to us
            </div>
            <div className="flex flex-col gap-1.5 text-sm text-ink">
              <a href={`${BUY_URL}/support`} className="hover:text-brand-blue-deep">Support</a>
              <span className="text-muted">{SUPPORT_EMAIL}</span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 w-full max-w-5xl border-t border-line px-6 pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Shaddai Comm Ventures. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
