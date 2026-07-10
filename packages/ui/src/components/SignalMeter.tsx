export interface SignalMeterProps {
  live?: boolean;
  className?: string;
}

const BAR_HEIGHTS = [5, 8, 11, 14];

export function SignalMeter({ live = false, className = '' }: SignalMeterProps) {
  return (
    <span className={`inline-flex items-end gap-0.5 ${className}`} aria-hidden="true">
      {BAR_HEIGHTS.map((height, i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${live ? 'bg-cyan' : 'bg-line'}`}
          style={{ height }}
        />
      ))}
    </span>
  );
}
