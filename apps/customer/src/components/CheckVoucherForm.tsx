'use client';

import { Badge } from '@shaddai/ui';
import { useState } from 'react';
import { ApiError, getVoucherStatus, type VoucherStatus } from '@/lib/api';
import { formatExpiry } from '@/lib/format';

export function CheckVoucherForm() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VoucherStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await getVoucherStatus(code.trim().toUpperCase()));
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

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SHADDAI-XXXXX"
          required
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-center font-mono text-[15px] uppercase tracking-[0.1em] outline-none focus:border-cyan"
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

      {result && (
        <div className="rounded-card bg-page p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-ink">{result.code}</span>
            <Badge status={result.status} />
          </div>
          <p className="mt-1 text-sm text-muted">{result.planName}</p>
          <p className="text-sm text-muted">{formatExpiry(result.expiresAt)}</p>
        </div>
      )}
    </div>
  );
}
