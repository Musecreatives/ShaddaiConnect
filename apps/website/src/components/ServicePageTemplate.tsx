import Link from 'next/link';
import { ServiceVisual } from './ServiceVisual';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const SUPPORT_EMAIL = 'support@shaddaicommunications.com';

export interface ServiceFeature {
  title: string;
  body: string;
}

export interface ServiceStat {
  value: string;
  label: string;
}

export function ServicePageTemplate({
  eyebrow,
  title,
  description,
  icon,
  features,
  tags,
  stats,
  ctaLabel,
  quoteMessage,
  primaryHref,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: ServiceFeature[];
  tags?: string[];
  stats?: ServiceStat[];
  ctaLabel: string;
  quoteMessage: string;
  /** Overrides the default WhatsApp/email quote CTA — used for the WiFi page, which links to the
   * real buy flow instead of a manual quote conversation. */
  primaryHref?: string;
  children?: React.ReactNode;
}) {
  const encodedMessage = encodeURIComponent(quoteMessage);

  return (
    <main className="flex flex-1 flex-col bg-page-dark text-white">
      <SiteHeader />

      <section className="relative overflow-hidden px-6 py-20 sm:px-16 sm:py-28">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[640px] -translate-x-1/2 rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(46,117,196,.14), transparent 60%)' }}
        />
        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col items-start gap-5">
          <Link href="/services" className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All services
          </Link>
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue-light">
            {eyebrow}
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">{title}</h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-white/45">{description}</p>

          {tags && tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-btn bg-brand-blue/10 px-3.5 py-1.5 text-sm font-medium text-brand-blue-light">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            {primaryHref ? (
              <a
                href={primaryHref}
                className="rounded-btn bg-brand-blue px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep"
              >
                {ctaLabel} →
              </a>
            ) : (
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodedMessage}`}
                className="rounded-btn bg-brand-blue px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep"
              >
                {ctaLabel}
              </a>
            )}
            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`}
                className="rounded-btn border border-line-dark px-7 py-3.5 text-[15px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                WhatsApp us
              </a>
            )}
          </div>
        </div>
        <div className="hidden justify-self-center lg:flex">
          <ServiceVisual icon={icon} />
        </div>
        </div>
      </section>

      {stats && stats.length > 0 && (
        <section className="border-t border-line-dark px-6 py-10 sm:px-16">
          <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-frame border border-line-dark bg-surface-dark p-5 text-center">
                <div className="font-mono text-2xl font-bold text-brand-blue-light sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {features && features.length > 0 && (
        <section className="border-t border-line-dark px-6 py-16 sm:px-16">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="mb-8 font-display text-2xl font-bold text-white">What&apos;s included</h2>
            <div className="flex flex-col">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="grid grid-cols-[48px_1fr] gap-5 border-t border-line-dark py-7 last:border-b sm:grid-cols-[60px_1fr_1fr]"
                >
                  <span className="font-mono text-sm font-bold text-brand-blue">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white sm:col-span-1">{feature.title}</h3>
                  <p className="text-[15px] leading-relaxed text-white/45 sm:col-span-1">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {children}

      <section className="border-t border-line-dark px-6 py-16 text-center sm:px-16">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Ready to get started?</h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-white/45">
          Tell us what you need — we&apos;ll get back to you with pricing for your setup.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {WHATSAPP_NUMBER && (
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`}
              className="rounded-btn bg-brand-blue px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep"
            >
              WhatsApp us →
            </a>
          )}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodedMessage}`}
            className="rounded-btn border border-line-dark px-7 py-3.5 text-[15px] font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Email us
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
