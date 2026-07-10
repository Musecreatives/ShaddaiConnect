export type VoucherStatus = 'unused' | 'active' | 'expired' | 'disabled';

const STATUS_CLASSES: Record<VoucherStatus, string> = {
  unused: 'bg-page text-muted border border-line',
  active: 'bg-success-tint text-success',
  expired: 'bg-amber-tint text-amber',
  disabled: 'bg-danger-tint text-danger',
};

export interface BadgeProps {
  status: VoucherStatus;
  className?: string;
}

export function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${STATUS_CLASSES[status]} ${className}`}
    >
      {status}
    </span>
  );
}
