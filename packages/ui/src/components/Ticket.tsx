import type { ReactNode } from 'react';

export interface TicketProps {
  code: string;
  planLabel: string;
  expiryLabel: string;
  qrSlot?: ReactNode;
  live?: boolean;
}

export function Ticket({ code, planLabel, expiryLabel, qrSlot, live = true }: TicketProps) {
  return (
    <div className="relative overflow-hidden rounded-frame bg-navy p-6 text-white">
      <div className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.09em] text-cyan">
        Voucher code
      </div>
      <div className="font-mono text-[22px] font-bold tracking-[0.12em]" data-live={live}>
        {code}
      </div>

      <div className="relative my-5 border-t border-dashed border-white/25">
        <span className="absolute -left-9 -top-2 h-4 w-4 rounded-full bg-page" />
        <span className="absolute -right-9 -top-2 h-4 w-4 rounded-full bg-page" />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-white/80">
          <div>{planLabel}</div>
          <div>{expiryLabel}</div>
        </div>
        {qrSlot && <div className="rounded-md bg-white p-2">{qrSlot}</div>}
      </div>
    </div>
  );
}
