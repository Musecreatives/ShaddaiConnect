'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, notifyImportedWaitlistSignups } from '@/lib/api';

export function NotifyImportedButton({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    if (
      !confirm(
        `Send the waitlist confirmation email to ${pendingCount} pending ${pendingCount === 1 ? 'signup' : 'signups'}?`,
      )
    ) {
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { notified } = await notifyImportedWaitlistSignups();
      setResult(`Sent to ${notified}.`);
      router.refresh();
    } catch (err) {
      setResult(err instanceof ApiError ? err.message : 'Failed to send.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || pendingCount === 0}
        className="rounded-btn border-[1.5px] border-line px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-cyan disabled:opacity-35"
      >
        {loading ? 'Sending…' : `Send confirmations (${pendingCount})`}
      </button>
      {result && <span className="text-sm text-muted">{result}</span>}
    </div>
  );
}
