'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getPublicPlans,
  getVoucherNotifications,
  getVoucherStatus,
  type Plan,
  type VoucherNotification,
  type VoucherStatus,
} from '@/lib/api';
import { formatPlanMeta } from '@/lib/format';
import { subscribeToVoucherPush, type PushSubscribeResult } from '@/lib/push';

const POLL_MS = 5_000;
const EXTEND_PROMPT_SECONDS = 5 * 60;

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function timeAgo(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function ExtendPanel({ plans }: { plans: Plan[] }) {
  const quickPlans = plans.filter((p) => p.planType === 'hourly').slice(0, 2);
  const monthly = plans.find((p) => p.planType === 'monthly');
  const options = [...quickPlans, ...(monthly ? [monthly] : [])].slice(0, 3);
  if (options.length === 0) return null;

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="mb-3 font-display text-sm font-semibold text-ink">Extend your time</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((plan) => (
          <Link
            key={plan.id}
            href={`/checkout?planId=${plan.id}`}
            className="flex flex-col items-center gap-0.5 rounded-btn border-[1.5px] border-line px-2 py-3 text-center transition-colors hover:border-brand-blue"
          >
            <span className="text-xs font-semibold text-ink">{plan.name}</span>
            <span className="font-mono text-sm font-bold text-brand-blue-deep">
              ₦{plan.priceNaira.toLocaleString('en-NG')}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NotificationHistory({ notifications }: { notifications: VoucherNotification[] }) {
  if (notifications.length === 0) return null;
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="mb-2 font-display text-sm font-semibold text-ink">Notifications</p>
      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <div key={n.id} className="border-b border-line pb-2 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">{n.title}</span>
              <span className="text-[10px] text-muted">{timeAgo(n.sentAt)}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SessionTimer({ voucherCode }: { voucherCode: string }) {
  const [status, setStatus] = useState<VoucherStatus | null>(null);
  const [notifications, setNotifications] = useState<VoucherNotification[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [pushResult, setPushResult] = useState<PushSubscribeResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [statusResult, notifResult] = await Promise.all([
          getVoucherStatus(voucherCode),
          getVoucherNotifications(voucherCode),
        ]);
        if (cancelled) return;
        setStatus(statusResult);
        setNotifications(notifResult);
      } catch {
        // Polling failure shouldn't break the ticket screen — just skip this tick.
      }
    }
    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [voucherCode]);

  useEffect(() => {
    getPublicPlans()
      .then(setPlans)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  async function handleEnableNotifications() {
    const result = await subscribeToVoucherPush(voucherCode);
    setPushResult(result);
  }

  if (!status) return null;

  const notifyButton =
    pushResult !== 'subscribed' ? (
      <button
        type="button"
        onClick={handleEnableNotifications}
        className="text-xs font-semibold text-brand-blue-deep hover:underline"
      >
        {pushResult === 'denied'
          ? 'Notifications blocked — enable in browser settings'
          : 'Notify me on this device'}
      </button>
    ) : null;

  if (status.status === 'unused') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-5 text-center">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber" />
          <p className="text-sm text-muted">
            Waiting for you to connect to <strong className="text-ink">&quot;Shaddai WiFi&quot;</strong>{' '}
            and enter this code — your timer starts the moment you connect.
          </p>
          {notifyButton}
        </div>
      </div>
    );
  }

  if (status.status === 'active' && status.activatedAt && status.sessionTimeoutSeconds) {
    const activatedMs = new Date(status.activatedAt).getTime();
    const remainingSeconds = Math.max(
      0,
      (activatedMs + status.sessionTimeoutSeconds * 1000 - now) / 1000,
    );
    const expired = remainingSeconds <= 0;
    const showExtend = !expired && remainingSeconds <= EXTEND_PROMPT_SECONDS;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-navy p-6 text-center text-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {expired ? 'Session ended' : 'Connected'}
          </div>
          <div className="font-mono text-5xl font-bold tabular-nums">
            {expired ? '0:00' : formatRemaining(remainingSeconds)}
          </div>
          <div className="text-xs text-white/50">remaining</div>
          {!expired && (
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={pushResult === 'subscribed'}
              className="mt-2 text-xs font-semibold text-brand-blue-light hover:underline disabled:opacity-60"
            >
              {pushResult === 'subscribed'
                ? 'Notifications on'
                : pushResult === 'denied'
                  ? 'Notifications blocked'
                  : 'Notify me when time runs low'}
            </button>
          )}
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <p className="mb-2 font-display text-sm font-semibold text-ink">Session details</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Voucher</span>
              <span className="font-mono text-ink">{status.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Plan</span>
              <span className="text-ink">{status.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Started</span>
              <span className="text-ink">
                {new Date(status.activatedAt).toLocaleString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {status.currentSession?.ipAddress && (
              <div className="flex justify-between">
                <span className="text-muted">IP address</span>
                <span className="font-mono text-ink">{status.currentSession.ipAddress}</span>
              </div>
            )}
            {status.currentSession && (
              <div className="flex justify-between">
                <span className="text-muted">Data used</span>
                <span className="font-mono text-ink">
                  {status.currentSession.dataUsedMb.toFixed(1)} MB
                </span>
              </div>
            )}
          </div>
        </div>

        {showExtend && <ExtendPanel plans={plans} />}
        <NotificationHistory notifications={notifications} />
      </div>
    );
  }

  // Monthly (paid subscription) plans: no live Session-Timeout countdown — vouchers.expiresAt is
  // days/weeks out, not minutes, so this shows the same session-details card without the big
  // clock, plus a calendar expiry date instead.
  if (status.status === 'active') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 rounded-card border border-line bg-navy p-6 text-center text-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Active
          </div>
          {status.expiresAt && (
            <div className="text-sm text-white/70">
              Expires{' '}
              {new Date(status.expiresAt).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )}
          {notifyButton && <div className="mt-1 [&_button]:text-brand-blue-light">{notifyButton}</div>}
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <p className="mb-2 font-display text-sm font-semibold text-ink">Session details</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Voucher</span>
              <span className="font-mono text-ink">{status.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Plan</span>
              <span className="text-ink">{status.planName}</span>
            </div>
            {status.currentSession?.ipAddress && (
              <div className="flex justify-between">
                <span className="text-muted">IP address</span>
                <span className="font-mono text-ink">{status.currentSession.ipAddress}</span>
              </div>
            )}
            {status.currentSession && (
              <div className="flex justify-between">
                <span className="text-muted">Data used (this session)</span>
                <span className="font-mono text-ink">
                  {status.currentSession.dataUsedMb.toFixed(1)} MB
                </span>
              </div>
            )}
          </div>
        </div>

        <NotificationHistory notifications={notifications} />
      </div>
    );
  }

  if (status.status === 'expired') {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-card border border-line bg-surface p-5 text-center text-sm text-muted">
          Your session has ended. Buy a plan below to keep browsing.
        </div>
        <ExtendPanel plans={plans} />
        <NotificationHistory notifications={notifications} />
      </div>
    );
  }

  return null;
}
