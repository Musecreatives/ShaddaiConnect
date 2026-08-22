/** Generic, icon-based hero visual for service pages — no stock photography (none of it would be
 * real photos of this business's actual work), reuses the shared `float`/`twinkle` keyframes
 * already defined in packages/ui/theme.css rather than inventing new animation. */
export function ServiceVisual({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="relative flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-frame border border-line-dark bg-surface-dark">
      <div
        className="pointer-events-none absolute inset-0 animate-float"
        style={{ background: 'radial-gradient(circle at 50% 45%, rgba(46,117,196,.16), transparent 65%)' }}
      />
      <span className="pointer-events-none absolute left-[18%] top-[22%] h-1 w-1 animate-twinkle rounded-full bg-white" />
      <span
        className="pointer-events-none absolute right-[22%] top-[35%] h-[3px] w-[3px] animate-twinkle rounded-full bg-white"
        style={{ animationDelay: '0.6s' }}
      />
      <span
        className="pointer-events-none absolute bottom-[28%] left-[30%] h-[2px] w-[2px] animate-twinkle rounded-full bg-white"
        style={{ animationDelay: '1.2s' }}
      />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-frame bg-brand-blue/10 text-brand-blue-light">
        {icon}
      </div>
    </div>
  );
}

export const SERVICE_ICONS = {
  wifi: (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  starlink: (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
    </svg>
  ),
  cctv: (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  'brand-identity': (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 8l10 6 10-6-10-6z" />
      <path d="M2 15l10 6 10-6" />
    </svg>
  ),
  'website-development': (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <circle cx="6.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="9" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  'software-development': (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  pos: (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="12" rx="2" />
      <path d="M9 21h6M12 15v6" />
      <path d="M8 8h8M8 11h5" />
    </svg>
  ),
} as const;
