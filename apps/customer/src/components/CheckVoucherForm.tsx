'use client';

import { useEffect, useState } from 'react';
import { ApiError, getVoucherStatus } from '@/lib/api';
import { SessionTimer } from './SessionTimer';

export function CheckVoucherForm({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? '');
  const [checkedCode, setCheckedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function check(value: string) {
    setLoading(true);
    setError(null);
    setCheckedCode(null);
    try {
      await getVoucherStatus(value);
      setCheckedCode(value);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "That code isn't valid. Check the dashes, or buy a new plan below."
          : 'Something went wrong checking that code. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  // A push notification about this voucher deep-links here with ?code=... — auto-check it
  // instead of leaving the customer to retype the code they just tapped a notification about.
  useEffect(() => {
    if (initialCode) check(initialCode.trim().toUpperCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await check(code.trim().toUpperCase());
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SHADDAI-XXXXX"
          required
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-center font-mono text-[15px] uppercase tracking-[0.1em] outline-none focus:border-brand-blue"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white disabled:opacity-35"
        >
          {loading ? 'Checking…' : 'Check code'}
        </button>
      </form>

      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {checkedCode && <SessionTimer voucherCode={checkedCode} />}
    </div>
  );
}
