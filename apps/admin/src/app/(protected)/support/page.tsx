export default function SupportPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Support</h1>
        <p className="mt-1 text-sm text-muted">
          Where customer support requests actually go right now.
        </p>
      </div>

      <div className="rounded-card border border-line bg-surface p-5">
        <p className="text-sm text-ink">
          There&apos;s no in-app ticket queue yet — customers reach you through WhatsApp/email
          below, or the contact form on the customer site&apos;s Support page (which emails
          shaddaicommunications@gmail.com directly via SendGrid). Requests won&apos;t show up
          here; check your inbox.
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between rounded-btn bg-page px-4 py-3">
            <span className="text-muted">WhatsApp Business</span>
            <span className="font-mono text-ink">{whatsapp || 'Not configured'}</span>
          </div>
          <div className="flex items-center justify-between rounded-btn bg-page px-4 py-3">
            <span className="text-muted">Support email</span>
            <span className="font-mono text-ink">{supportEmail || 'Not configured'}</span>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-line bg-amber-tint p-5 text-xs text-ink">
        <strong>If you want a real ticket queue here</strong> — visible replies, status tracking,
        assigning to a second admin — that&apos;s a separate feature (a support_tickets table plus
        this page becoming a real inbox) that hasn&apos;t been built. Worth doing once there&apos;s
        enough support volume that WhatsApp/email alone gets hard to track.
      </div>
    </div>
  );
}
