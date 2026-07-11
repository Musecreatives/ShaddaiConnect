export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="text-[11.5px] font-semibold text-muted">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold text-ink">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted">{hint}</div>}
    </div>
  );
}
