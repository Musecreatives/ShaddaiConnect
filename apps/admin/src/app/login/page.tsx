'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, login } from '@/lib/api';

function EmailField({ id }: { id: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-line">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </span>
      <input
        id={id}
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="admin@shaddai.local"
        className="w-full rounded-btn border-[1.5px] border-line bg-page py-3 pl-11 pr-4 text-[15px] text-ink outline-none focus:border-brand-blue"
      />
    </div>
  );
}

function PasswordField({ id }: { id: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-line">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
      <input
        id={id}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        className="w-full rounded-btn border-[1.5px] border-line bg-page py-3 pl-11 pr-4 text-[15px] text-ink outline-none focus:border-brand-blue"
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    // Read straight off the form's live DOM values, not React state — browser autofill
    // (especially a fast click right after the browser fills both fields) can populate the
    // inputs before React's onChange/state catches up, so trusting state here occasionally
    // submits stale empty values on the first try.
    const formData = new FormData(e.currentTarget);
    const submittedEmail = String(formData.get('email') ?? '');
    const submittedPassword = String(formData.get('password') ?? '');
    try {
      await login(submittedEmail, submittedPassword);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Try again.');
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Desktop: split brand panel + form */}
      <main className="hidden min-h-screen lg:flex">
        <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-navy p-16">
          <div
            className="pointer-events-none absolute -top-10 left-[15%] h-45 w-45 animate-float rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(46,117,196,.2), transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute bottom-[10%] right-[10%] h-60 w-60 animate-float rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(46,117,196,.12), transparent 70%)', animationDelay: '1.5s' }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ backgroundImage: 'radial-gradient(rgba(46,117,196,.07) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />

          <div className="relative z-10 max-w-[420px]">
            <div className="mb-12 flex items-center gap-3">
              <Image src="/logo.png" alt="Shaddai" width={44} height={44} className="shrink-0 rounded-xl shadow-[0_8px_24px_rgba(46,117,196,.3)]" />
              <span className="font-display text-xl font-bold tracking-tight text-white">Shaddai</span>
            </div>
            <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-white">
              Network management, simplified.
            </h1>
            <p className="mt-4 max-w-[360px] text-[15px] leading-relaxed text-white/45">
              Monitor sessions, manage vouchers, track revenue, and keep your network running —
              all from one dashboard.
            </p>

            <div className="mt-10 flex gap-8">
              {[
                { value: '7', label: 'Services managed' },
                { value: '1', label: 'Local team' },
                { value: '24/7', label: 'Voucher access' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-[28px] font-bold text-white">{stat.value}</div>
                  <div className="mt-0.5 text-xs text-white/35">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-16 text-[11px] text-white/20">
            © {new Date().getFullYear()} Shaddai Comm Ventures
          </div>
        </div>

        <div className="flex w-[460px] shrink-0 flex-col items-center justify-center bg-surface p-10">
          <form onSubmit={handleSubmit} className="w-full max-w-[380px] animate-fade-slide-in">
            <div className="mb-9">
              <h2 className="font-display text-[26px] font-bold tracking-tight text-ink">Welcome back</h2>
              <p className="mt-2 text-sm text-muted">Sign in to your admin dashboard</p>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="email-desktop" className="mb-1.5 block text-[13px] font-medium text-ink">
                  Email address
                </label>
                <EmailField id="email-desktop" />
              </div>
              <div>
                <label htmlFor="password-desktop" className="mb-1.5 block text-[13px] font-medium text-ink">
                  Password
                </label>
                <PasswordField id="password-desktop" />
              </div>

              {error && (
                <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 w-full rounded-btn bg-brand-blue py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(46,117,196,.3)] transition-all hover:-translate-y-px hover:bg-brand-blue-deep hover:shadow-[0_6px_24px_rgba(46,117,196,.4)] disabled:opacity-40"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-line">
              Protected by pfSense ·{' '}
              <span className="rounded bg-page px-1.5 py-0.5 font-mono text-[11px] text-muted">TLS 1.3</span>
            </p>
          </form>
        </div>
      </main>

      {/* Mobile: dark brand header + white bottom-sheet form */}
      <main className="flex min-h-screen flex-col bg-navy lg:hidden">
        <div className="relative overflow-hidden px-7 pb-8 pt-10 text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-[-40px] h-75 w-75 -translate-x-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(46,117,196,.15), transparent 70%)' }}
          />
          <div className="relative z-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_8px_32px_rgba(46,117,196,.35)]">
              <Image src="/logo.png" alt="Shaddai" width={56} height={56} className="rounded-2xl" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">Shaddai Admin</h1>
            <p className="mt-1.5 text-[13px] text-white/40">Sign in to manage your network</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col rounded-t-[24px] bg-surface px-6 pb-10 pt-8 animate-fade-slide-in"
        >
          <div className="flex flex-1 flex-col gap-5">
            <div>
              <label htmlFor="email-mobile" className="mb-1.5 block text-[13px] font-medium text-ink">
                Email address
              </label>
              <EmailField id="email-mobile" />
            </div>
            <div>
              <label htmlFor="password-mobile" className="mb-1.5 block text-[13px] font-medium text-ink">
                Password
              </label>
              <PasswordField id="password-mobile" />
            </div>

            {error && (
              <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-btn bg-brand-blue py-4 text-base font-semibold text-white shadow-[0_4px_16px_rgba(46,117,196,.3)] disabled:opacity-40"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </div>

          <p className="mt-6 text-center text-[11px] text-line">
            Protected by pfSense ·{' '}
            <span className="rounded bg-page px-1.5 py-0.5 font-mono text-[10px] text-muted">TLS 1.3</span>
          </p>
        </form>
      </main>
    </>
  );
}
