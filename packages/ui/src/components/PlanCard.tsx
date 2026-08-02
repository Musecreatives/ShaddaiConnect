import { SignalMeter } from './SignalMeter';

export interface PlanCardProps {
  name: string;
  meta: string;
  priceNaira: number;
  selected?: boolean;
  popular?: boolean;
  onSelect?: () => void;
}

export function PlanCard({ name, meta, priceNaira, selected, popular, onSelect }: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-card border-[1.5px] px-4 py-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-8px_rgba(46,117,196,.35)] ${
        selected ? 'border-brand-blue bg-brand-blue-light/15' : 'border-line bg-surface'
      }`}
    >
      <span className="flex items-center gap-3">
        <SignalMeter live={selected} />
        <span>
          <span className="block font-display font-semibold text-ink">{name}</span>
          <span className="block text-sm text-muted">{meta}</span>
        </span>
        {popular && (
          <span className="rounded-full bg-amber-tint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber">
            Popular
          </span>
        )}
      </span>
      <span className="font-mono font-bold text-ink">₦{priceNaira.toLocaleString('en-NG')}</span>
    </button>
  );
}
