'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/lib/api';
import { NotificationBell } from './NotificationBell';

export function Topbar({
  email,
  apiHealthy,
  onMenuClick,
}: {
  email: string;
  apiHealthy: boolean;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/85 px-4 py-3.5 backdrop-blur-md sm:px-7">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-1 rounded-md p-1.5 text-muted md:hidden"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div
          className={`flex items-center gap-2 text-[11.5px] font-semibold ${apiHealthy ? 'text-success' : 'text-danger'}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${apiHealthy ? 'bg-success shadow-[0_0_0_3px_var(--color-success-tint)]' : 'bg-danger shadow-[0_0_0_3px_var(--color-danger-tint)]'}`}
          />
          <span className="hidden sm:inline">{apiHealthy ? 'API reachable' : 'API unreachable'}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="h-6 w-px bg-line" />
        <span className="hidden text-[12.5px] text-muted sm:inline">{email}</span>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-[9px] border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-brand-blue disabled:opacity-50"
        >
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
