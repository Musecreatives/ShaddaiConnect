import { Sparkline } from './Sparkline';

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  /** Real percentage vs. a comparable prior period — omit rather than fake one. */
  deltaPct?: number;
  trend?: number[];
}

export function StatCard({ label, value, hint, deltaPct, trend }: StatCardProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11.5px] font-semibold text-muted">{label}</div>
        {trend && trend.length > 0 && <Sparkline values={trend} />}
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-ink">{value}</div>
      {deltaPct !== undefined ? (
        <div className={`mt-1 text-[11px] font-semibold ${deltaPct >= 0 ? 'text-success' : 'text-danger'}`}>
          {deltaPct >= 0 ? '↑' : '↓'} {Math.abs(deltaPct).toFixed(1)}% vs yesterday
        </div>
      ) : (
        hint && <div className="mt-1 text-[11px] text-muted">{hint}</div>
      )}
    </div>
  );
}
