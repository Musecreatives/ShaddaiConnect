'use client';

import { useEffect, useRef, useState } from 'react';
import { getNotifications, type AdminNotification } from '@/lib/api';

const POLL_MS = 30_000;

function iconFor(tags: string[]): { bg: string; svg: React.ReactNode } {
  const tag = tags[0];
  if (tag === 'moneybag') {
    return {
      bg: 'bg-success-tint',
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <path d="M1 10h22" />
        </svg>
      ),
    };
  }
  if (tag === 'bust_in_silhouette' || tag === 'raised_hand') {
    return {
      bg: 'bg-brand-blue-light/20',
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E75C4" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
        </svg>
      ),
    };
  }
  if (tag === 'speech_balloon') {
    return {
      bg: 'bg-amber-tint',
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    };
  }
  return {
    bg: 'bg-page',
    svg: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B94A7" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  };
}

function timeAgo(ms: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getNotifications();
        if (!cancelled) setNotifications(result);
      } catch {
        // Notifications are a nice-to-have overlay — a failed fetch shouldn't disrupt the rest
        // of the admin console, so this fails silently rather than surfacing an error banner.
      }
    }
    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasUnread = notifications.some((n) => n.time > lastSeenAt);
  const unread = notifications.filter((n) => n.time > lastSeenAt);
  const earlier = notifications.filter((n) => n.time <= lastSeenAt);

  function toggle() {
    setOpen((prev) => !prev);
  }

  function markAllRead() {
    setLastSeenAt(Date.now());
  }

  function renderRow(n: AdminNotification) {
    const { bg, svg } = iconFor(n.tags);
    return (
      <div key={n.id} className="flex gap-2.5 border-b border-line px-4 py-3 last:border-0">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>{svg}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-ink">{n.title}</div>
          <div className="mt-0.5 text-xs text-muted">{n.message}</div>
          <div className="mt-1 text-[11px] text-muted/70">{timeAgo(n.time)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-page"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-surface bg-danger" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-hidden rounded-t-2xl border-t border-line bg-surface shadow-lg sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:max-h-105 sm:w-85 sm:rounded-xl sm:border">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-sm font-semibold text-ink">Notifications</span>
              {hasUnread && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-semibold text-brand-blue"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[calc(80vh-49px)] overflow-y-auto sm:max-h-90">
              {notifications.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted">Nothing yet.</p>
              )}
              {unread.length > 0 && (
                <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  New
                </div>
              )}
              {unread.map(renderRow)}
              {earlier.length > 0 && unread.length > 0 && (
                <div className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Earlier
                </div>
              )}
              {earlier.map(renderRow)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
