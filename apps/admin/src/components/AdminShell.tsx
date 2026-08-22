'use client';

import { useState } from 'react';
import { MobileTabBar } from './MobileTabBar';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AdminShell({
  email,
  apiHealthy,
  children,
}: {
  email: string;
  apiHealthy: boolean;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar email={email} apiHealthy={apiHealthy} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-page p-4 sm:p-7">{children}</main>
        <MobileTabBar onMore={() => setMobileOpen(true)} />
      </div>
    </div>
  );
}
