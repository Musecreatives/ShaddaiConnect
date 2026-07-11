import { BackLink } from '@/components/BackLink';

export const metadata = {
  title: 'Support — Shaddai WiFi',
};

export default function SupportPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const hasAnyChannel = Boolean(whatsappNumber || supportEmail);

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <BackLink href="/" label="Back to plans" />

      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Need help?</h1>
        <p className="mt-1 text-sm text-muted">
          Trouble with a voucher, a payment, or connecting — reach us directly.
        </p>
      </div>

      {hasAnyChannel ? (
        <div className="flex flex-col gap-3">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface px-4 py-3.5 transition-colors hover:border-cyan"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-tint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C7 3 3 7 3 12C3 13.6 3.4 15.1 4.2 16.4L3 21L7.7 19.8C9 20.5 10.5 21 12 21C17 21 21 17 21 12C21 7 17 3 12 3Z"
                    stroke="#149E7C"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">WhatsApp</span>
                <span className="block text-xs text-muted">Usually fastest</span>
              </span>
            </a>
          )}

          {supportEmail && (
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-surface px-4 py-3.5 transition-colors hover:border-cyan"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-tint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="#0E9AA8" strokeWidth="1.6" />
                  <path d="M3 6L12 13L21 6" stroke="#0E9AA8" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">Email</span>
                <span className="block text-xs text-muted">{supportEmail}</span>
              </span>
            </a>
          )}
        </div>
      ) : (
        <p className="rounded-card border border-line bg-surface p-4 text-sm text-muted">
          Support contact details aren&apos;t set up yet. Check back shortly.
        </p>
      )}

      <div className="rounded-card bg-page p-4 text-sm text-muted">
        <p className="mb-2 font-display font-semibold text-ink">Before you reach out</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>Have your voucher code ready if it&apos;s about a purchase.</li>
          <li>
            You can check a code&apos;s status yourself at{' '}
            <a href="/check" className="text-cyan-deep underline">
              /check
            </a>{' '}
            first.
          </li>
        </ul>
      </div>
    </main>
  );
}
