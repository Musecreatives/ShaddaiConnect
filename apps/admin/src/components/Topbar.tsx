'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/lib/api';

export function Topbar({ email, apiHealthy }: { email: string; apiHealthy: boolean }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between border-b border-line bg-surface px-7 py-3.5">
      <div
        className={`flex items-center gap-2 text-[11.5px] font-semibold ${apiHealthy ? 'text-success' : 'text-danger'}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${apiHealthy ? 'bg-success shadow-[0_0_0_3px_var(--color-success-tint)]' : 'bg-danger shadow-[0_0_0_3px_var(--color-danger-tint)]'}`}
        />
        {apiHealthy ? 'API reachable' : 'API unreachable'}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12.5px] text-muted">{email}</span>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="rounded-[9px] border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink transition-colors hover:border-cyan disabled:opacity-50"
        >
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
