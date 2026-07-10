import Link from 'next/link';

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-sm font-semibold text-muted">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Link>
  );
}
