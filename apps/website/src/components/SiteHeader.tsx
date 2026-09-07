import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/work', label: 'Our Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/journal', label: 'Journal' },
  { href: '/audit', label: 'Free Review' },
  { href: '/careers', label: 'Careers' },
];

/* Header stays a fixed dark navy in both themes (matching the imported design) rather than
   flipping with ThemeToggle — it's a deliberate brand bar, not page content. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Shaddai Communications" width={32} height={32} className="shrink-0" />
          <span className="font-display text-[17px] font-normal tracking-wide text-white">SHADDAI</span>
        </Link>
        <div className="ml-auto hidden items-center gap-0.5 font-sans text-sm font-semibold lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-btn px-3 py-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <ThemeToggle />
        <Link
          href="/contact"
          className="rounded-full bg-white px-5 py-2.5 font-sans text-sm font-bold text-navy transition-colors hover:bg-brand-blue-light"
        >
          Request a Consultation
        </Link>
      </nav>
    </header>
  );
}
