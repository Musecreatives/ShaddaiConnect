'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Try again.');
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[380px] flex-col gap-4 rounded-frame border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(13,19,33,.04),0_22px_44px_-14px_rgba(13,19,33,.20)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-navy">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
          <div>
            <div className="font-display text-[15px] font-bold text-ink">Shaddai Admin</div>
            <div className="text-[11px] text-muted">Sign in to manage the network</div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-cyan"
          />
        </div>

        {error && (
          <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 w-full rounded-btn bg-navy py-3 text-[15px] font-bold text-white transition-colors hover:bg-navy-2 disabled:opacity-35"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
