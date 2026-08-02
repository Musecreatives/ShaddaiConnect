'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-page p-6 text-center">
      <h1 className="font-display text-xl font-bold text-ink">Something went wrong</h1>
      <p className="text-sm text-muted">
        That didn&apos;t load correctly. This is usually temporary — try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-btn bg-navy px-5 py-3 text-[15px] font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
