import Link from 'next/link';
import { BuyShell } from '@/components/BuyShell';

export const metadata = {
  title: "Device blocked — Shaddai WiFi",
};

/**
 * Where pfSense sends a device whose MAC is on the captive portal's block list — its
 * `blockedmacsurl` points here, and index.php redirects to it before the login form is ever
 * shown (portal_reply_page($cpcfg['blockedmacsurl'], "redir")).
 *
 * Without this the device just silently fails to get online with no explanation, which reads as
 * "the WiFi is broken" rather than "this device was blocked" — the admin gets a support call
 * either way, so it's better to say so plainly and point at support.
 *
 * NOTE: this must stay on a host that's in the captive portal's Allowed Hostnames (walled
 * garden) — a blocked client has no internet, so a page it can't reach is no better than
 * silence. buy.shaddaicommunications.com is already allowed.
 */
export default function BlockedPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <BuyShell>
      <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6 lg:flex-none lg:rounded-2xl lg:border lg:border-line lg:bg-surface lg:p-8 lg:shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-tint">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#d8455f" strokeWidth="2" />
              <path d="M5.6 5.6l12.8 12.8" stroke="#d8455f" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">This device can&apos;t connect</h1>
            <p className="mt-1.5 text-sm text-muted">
              Access from this device has been blocked on the Shaddai WiFi network. Any voucher
              entered on it won&apos;t work until the block is lifted.
            </p>
          </div>
        </div>

        <div className="rounded-card border border-line bg-page px-4 py-3.5 text-sm leading-relaxed text-muted">
          This usually happens when a device breaks the fair-use rules — most often by claiming
          the free trial repeatedly under different names. If you think this is a mistake, get in
          touch and we&apos;ll take a look.
        </div>

        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-btn bg-navy py-3.5 text-center text-[15px] font-bold text-white transition-colors hover:bg-brand-blue-deep"
          >
            Message support on WhatsApp
          </a>
        )}
        {supportEmail && (
          <a
            href={`mailto:${supportEmail}`}
            className="w-full rounded-btn border-[1.5px] border-line py-3.5 text-center text-[15px] font-bold text-ink transition-colors hover:border-brand-blue"
          >
            Email {supportEmail}
          </a>
        )}

        <Link
          href="/support"
          className="text-center text-xs font-semibold text-muted transition-colors hover:text-brand-blue-deep"
        >
          Other ways to reach us
        </Link>

        <p className="text-center text-[11px] leading-relaxed text-muted">
          Shaddai Comm Ventures · Ugbowo BDPA Estate, Benin City
        </p>
      </main>
    </BuyShell>
  );
}
