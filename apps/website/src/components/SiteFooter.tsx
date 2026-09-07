import Image from 'next/image';
import Link from 'next/link';
import { NewsletterForm } from './NewsletterForm';
import { SHARES } from '@/lib/landing-data';

const SUPPORT_EMAIL = 'support@shaddaicommunications.com';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Our Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/journal', label: 'Journal' },
  { href: '/audit', label: 'Free Review' },
  { href: '/careers', label: 'Careers' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-page dark:border-line-dark dark:bg-page-dark">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-16">
        <div className="grid gap-10 sm:grid-cols-[1.1fr_1fr_1fr_1.1fr]">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Shaddai Communications" width={28} height={28} />
            <span className="font-display text-base font-normal text-ink dark:text-white">SHADDAI</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-sm font-semibold text-muted transition-colors hover:text-ink dark:text-white/50 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 font-sans text-sm font-bold text-ink dark:text-white">Contact</div>
              <div className="flex flex-col gap-1 font-sans text-sm text-muted dark:text-white/50">
                <span>Ugbowo BDPA Estate, Benin City</span>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="transition-colors hover:text-ink dark:hover:text-white">
                  {SUPPORT_EMAIL}
                </a>
                {WHATSAPP_NUMBER && (
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    className="transition-colors hover:text-ink dark:hover:text-white"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
            <div>
              <div className="mb-2 font-sans text-sm font-bold text-ink dark:text-white">Follow</div>
              <div className="flex gap-2">
                {SHARES.map((s) => (
                  <span
                    key={s}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line font-sans text-xs font-bold text-ink dark:border-line-dark dark:text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1 font-sans text-sm font-bold text-ink dark:text-white">Newsletter</div>
            <p className="mb-3 font-sans text-sm leading-relaxed text-muted dark:text-white/50">
              Occasional notes on setups we&apos;ve worked on.
            </p>
            <NewsletterForm />
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 font-sans text-xs text-muted/80 dark:border-line-dark dark:text-white/30">
          <span>© {new Date().getFullYear()} Shaddai Communications. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
