'use client';

// No newsletter backend exists yet — matches the imported design's own mock (onSubmit prevents
// default) rather than pretending to submit anywhere real.
export function NewsletterForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
      <input
        type="email"
        placeholder="Email"
        className="min-w-0 flex-1 rounded-btn border border-line bg-surface px-3.5 py-2.5 font-sans text-sm text-ink dark:border-line-dark dark:bg-surface-dark dark:text-white"
      />
      <button
        type="submit"
        className="rounded-btn bg-navy px-4 font-sans text-sm font-bold text-white transition-colors hover:bg-brand-blue dark:bg-brand-blue-light dark:text-navy"
      >
        →
      </button>
    </form>
  );
}
