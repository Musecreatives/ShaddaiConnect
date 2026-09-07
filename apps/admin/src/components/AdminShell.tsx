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
    // `h-screen overflow-hidden` + an internally-scrolling <main> is right for the app, but it
    // clips printing to a single screenful — a 40-card batch printed as 5 cards and stopped.
    // The print: overrides drop the viewport box so the whole document flows onto as many pages
    // as it needs. Chrome (sidebar/topbar/tabbar) hides itself via its own print:hidden.
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
        <Topbar email={email} apiHealthy={apiHealthy} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-page p-4 sm:p-7 print:overflow-visible print:bg-white print:p-0">
          {children}
        </main>
        <MobileTabBar onMore={() => setMobileOpen(true)} />
      </div>
    </div>
  );
}
