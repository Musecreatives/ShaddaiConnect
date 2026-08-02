'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, notifyWaitlistLaunch } from '@/lib/api';

export function NotifyWaitlistButton({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm(`Send the launch email to ${pendingCount} waitlist ${pendingCount === 1 ? 'entry' : 'entries'} with an email on file?`)) {
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { notified } = await notifyWaitlistLaunch();
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
        className="rounded-btn bg-navy px-4 py-2.5 text-sm font-bold text-white disabled:opacity-35"
      >
        {loading ? 'Sending…' : `Notify launch (${pendingCount})`}
      </button>
      {result && <span className="text-sm text-muted">{result}</span>}
    </div>
  );
}
