'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function VouchersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9C4.1 9 5 8.1 5 7C5 5.9 4.1 5 3 5V4C3 3.4 3.4 3 4 3H20C20.6 3 21 3.4 21 4V5C19.9 5 19 5.9 19 7C19 8.1 19.9 9 21 9V15C19.9 15 19 15.9 19 17C19 18.1 19.9 19 21 19V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V19C4.1 19 5 18.1 5 17C5 15.9 4.1 15 3 15V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PlansIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3L20 3L21 4L21 12L12 21L3 12L3 4L4 3L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SessionsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 20C3 16.5 5.5 14 9 14C12.5 14 15 16.5 15 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15.5 14.3C18.2 14.7 20 16.9 20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="16" cy="7.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 12H7L9 5L13 19L15 12H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.5723 3.40365 15.0504 4.11229 16.3355L3 21L7.66449 19.8877C8.94961 20.5964 10.4277 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19.4 15A1.65 1.65 0 0 0 21 12A1.65 1.65 0 0 0 19.4 9M4.6 9A1.65 1.65 0 0 0 3 12A1.65 1.65 0 0 0 4.6 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NAV_GROUPS = [
  {
    label: 'Operate',
    items: [
      { href: '/', label: 'Dashboard', Icon: DashboardIcon },
      { href: '/vouchers', label: 'Vouchers', Icon: VouchersIcon },
      { href: '/plans', label: 'Plans', Icon: PlansIcon },
      { href: '/payments', label: 'Payments', Icon: PaymentsIcon },
      { href: '/sessions', label: 'Sessions', Icon: SessionsIcon },
    ],
  },
  {
    label: 'Manage',
    items: [
      { href: '/customers', label: 'Customers', Icon: CustomersIcon },
      { href: '/network', label: 'Network / Usage', Icon: NetworkIcon },
      { href: '/support', label: 'Support', Icon: SupportIcon },
      { href: '/settings', label: 'Settings', Icon: SettingsIcon },
    ],
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-1 overflow-y-auto bg-navy p-4">
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

      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-4">
          <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wide text-white/35">
            {group.label}
          </div>
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-[9px] border-l-[3px] px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? 'border-cyan bg-navy-2 text-white'
                    : 'border-transparent text-white/60 hover:bg-navy-2 hover:text-white'
                }`}
              >
                <item.Icon />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
