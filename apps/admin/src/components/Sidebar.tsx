'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/vouchers', label: 'Vouchers' },
  { href: '/plans', label: 'Plans' },
  { href: '/payments', label: 'Payments' },
  { href: '/sessions', label: 'Sessions' },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-1 bg-navy p-4">
      <div className="mb-5 flex items-center gap-2.5 px-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-navy-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12C8.9 8.5 15.1 8.5 19 12"
              stroke="#18C7D8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M1.5 8.5C7 3.6 17 3.6 22.5 8.5"
              stroke="#18C7D8"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="12" cy="19" r="1.8" fill="#18C7D8" />
          </svg>
        </div>
        <span className="font-display text-[14px] font-bold text-white">Shaddai Admin</span>
      </div>

      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-[9px] border-l-[3px] px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
              active
                ? 'border-cyan bg-navy-2 text-white'
                : 'border-transparent text-white/60 hover:bg-navy-2 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
