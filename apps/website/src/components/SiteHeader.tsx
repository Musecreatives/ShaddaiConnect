import Image from 'next/image';
import Link from 'next/link';

const BUY_URL = process.env.NEXT_PUBLIC_BUY_URL ?? 'https://buy.shaddaicommunications.com';

const NAV_LINKS = [
  { href: '/#pricing', label: 'WiFi Plans' },
  { href: '/services', label: 'Services' },
  { href: '/#faq', label: 'FAQ' },
];

export function SiteHeader() {
  return (
    <nav className="border-b border-line-dark px-6 py-5 sm:px-16">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Shaddai Communications" width={30} height={30} className="shrink-0" />
          <span className="font-display text-[15px] font-bold text-white">SHADDAI</span>
        </Link>
        <div className="ml-auto flex items-center gap-6 font-mono text-xs uppercase tracking-wide text-white/40">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hidden transition-colors hover:text-white sm:inline">
              {link.label}
            </Link>
          ))}
        </div>
        <a
          href={BUY_URL}
          className="rounded-btn bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep"
        >
          Buy a voucher →
        </a>
      </div>
    </nav>
  );
}
