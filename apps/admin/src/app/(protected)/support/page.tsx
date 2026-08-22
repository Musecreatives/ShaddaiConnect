import { SupportTicketsClient } from '@/components/SupportTicketsClient';
import { getSupportTicketsServer } from '@/lib/server-api';

export default async function SupportPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const tickets = await getSupportTicketsServer();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Support</h1>
        <p className="mt-1 text-sm text-muted">
          Messages from the customer site&apos;s contact form. WhatsApp/email below stay the
          fastest channels for anything urgent.
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm sm:flex-row">
        <div className="flex flex-1 items-center justify-between rounded-btn border border-line bg-surface px-4 py-3">
          <span className="text-muted">WhatsApp Business</span>
          <span className="font-mono text-ink">{whatsapp || 'Not configured'}</span>
        </div>
        <div className="flex flex-1 items-center justify-between rounded-btn border border-line bg-surface px-4 py-3">
          <span className="text-muted">Support email</span>
          <span className="font-mono text-ink">{supportEmail || 'Not configured'}</span>
        </div>
      </div>

      <SupportTicketsClient initialTickets={tickets} />
    </div>
  );
}
