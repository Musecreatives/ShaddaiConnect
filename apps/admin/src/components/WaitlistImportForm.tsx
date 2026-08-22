'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { ApiError, importWaitlistCsv, type WaitlistImportSummary } from '@/lib/api';

export function WaitlistImportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<WaitlistImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await importWaitlistCsv(file);
      setSummary(result);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Import failed.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-btn border-[1.5px] border-line px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-brand-blue">
          {loading ? 'Importing…' : 'Import CSV'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>
      </div>
      {summary && (
        <p className="text-sm text-muted">
          Added {summary.added}, skipped {summary.skipped} (already on the list)
          {summary.errors.length > 0 && `, ${summary.errors.length} row(s) had errors`}.
          {summary.errors.length > 0 && (
            <span className="mt-1 block text-xs text-danger">{summary.errors.join(' ')}</span>
          )}
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
