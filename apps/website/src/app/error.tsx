'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-xl font-semibold text-white">Something went wrong</h1>
      <p className="text-sm text-white/45">
        That didn&apos;t load correctly. This is usually temporary — try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-btn bg-brand-blue px-5 py-3 text-[15px] font-bold text-white"
      >
        Try again
      </button>
    </main>
  );
}
