'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useConfirm } from '@/components/DialogProvider';
import { ApiError, notifyFailedPayments, notifyTrialUpsell } from '@/lib/api';

const ACTIONS = {
  trialUpsell: notifyTrialUpsell,
  failedPayments: notifyFailedPayments,
} as const;

export function NotifyCustomersButton({
  pendingCount,
  label,
  confirmText,
  kind,
}: {
  pendingCount: number;
  label: string;
  confirmText: string;
  kind: keyof typeof ACTIONS;
}) {
  const router = useRouter();
  const confirmDialog = useConfirm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    if (!(await confirmDialog(confirmText, { title: label }))) return;
    setLoading(true);
    setResult(null);
    try {
      const { notified } = await ACTIONS[kind]();
      setResult(`Sent to ${notified}.`);
      router.refresh();
    } catch (err) {
      setResult(err instanceof ApiError ? err.message : 'Failed to send.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || pendingCount === 0}
        className="rounded-btn border border-line px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep disabled:opacity-35"
      >
        {loading ? 'Sending…' : `${label} (${pendingCount})`}
      </button>
      {result && <span className="text-xs text-muted">{result}</span>}
    </div>
  );
}
