import Link from 'next/link';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata = { title: 'Services — Shaddai Communications' };

const SERVICES = [
  { slug: 'wifi', title: 'Community WiFi', body: 'Fast, affordable internet for the estate — buy a voucher and connect in under a minute.' },
  { slug: 'starlink', title: 'Starlink Installation', body: 'Unlimited satellite internet, fully installed — 1 month free via our referral.' },
  { slug: 'cctv', title: 'CCTV Installation', body: 'Professional camera installation for homes, shops, and offices, with remote monitoring.' },
  { slug: 'brand-identity', title: 'Brand Identity', body: 'Logo, guidelines, and print materials — a cohesive identity from day one.' },
  { slug: 'website-development', title: 'Website Development', body: 'A professional website, built and hosted for you — no technical know-how needed.' },
  { slug: 'software-development', title: 'Software Development', body: 'Custom apps and management tools built around how your business actually works.' },
  { slug: 'pos', title: 'POS & Business Tools', body: 'A simple digital till for tracking sales, stock, and daily takings.' },
];

export default function ServicesIndexPage() {
  return (
    <main className="flex flex-1 flex-col bg-page-dark text-white">
      <SiteHeader />

      <section className="px-6 py-20 sm:px-16 sm:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue-light">
            Everything we offer
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Everything your home and business runs on.
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-white/45">
            WiFi is one of seven things we do — pick what you need below.
          </p>
        </div>
      </section>

      <section className="border-t border-line-dark px-6 py-4 sm:px-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col">
          {SERVICES.map((service, i) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group grid grid-cols-[48px_1fr_20px] items-center gap-5 border-b border-line-dark py-7 transition-colors first:border-t hover:bg-white/[0.02] sm:grid-cols-[60px_1fr_1fr_20px]"
            >
              <span className="font-mono text-sm font-bold text-brand-blue">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="font-display text-lg font-bold text-white">{service.title}</h2>
              <p className="hidden text-sm text-white/45 sm:block">{service.body}</p>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
