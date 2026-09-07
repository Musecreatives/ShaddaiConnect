/**
 * Stand-in for imagery that doesn't exist yet (team portraits, journal photos, case-study
 * shots) — an abstract gradient rather than a broken image or a debug label, so the page still
 * looks intentional to visitors. Swap for a real <Image> (or an admin-uploaded one, once the
 * planned Media Library CMS exists) as soon as one is available.
 */
export function PlaceholderVisual({
  className = '',
  label,
  children,
}: {
  className?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[repeating-linear-gradient(135deg,var(--color-line)_0,var(--color-line)_12px,var(--color-page)_12px,var(--color-page)_24px)] dark:bg-[repeating-linear-gradient(135deg,var(--color-line-dark)_0,var(--color-line-dark)_12px,var(--color-surface-dark)_12px,var(--color-surface-dark)_24px)] ${className}`}
    >
      {children ??
        (label && (
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-muted/70 dark:text-white/30">
            {label}
          </span>
        ))}
    </div>
  );
}
