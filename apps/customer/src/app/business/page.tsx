import { BackLink } from '@/components/BackLink';

export const metadata = {
  title: 'Business Packages — Shaddai WiFi',
};

interface Package {
  name: string;
  eyebrow: string;
  description: string;
  bullets: string[];
}

const PACKAGES: Package[] = [
  {
    name: 'Business WiFi for POS',
    eyebrow: 'For shop owners',
    description:
      'A dedicated, discounted connection sized for running your POS terminal reliably — priced for small stores, not casual browsing.',
    bullets: [
      'Priority bandwidth so card/transfer payments don’t stall',
      'Discounted monthly rate for verified store owners in our coverage area',
      'Same voucher system — no new app or account needed',
    ],
  },
  {
    name: 'CCTV Setup',
    eyebrow: 'For businesses in our coverage area',
    description:
      'Camera installation and setup for your shop or premises, run over our network. Priced per site after a quick look at your location.',
    bullets: [
      'On-site survey to place cameras and confirm coverage',
      'Installation included in the quote — no separate installer to find',
      'Ongoing connectivity billed like any other business plan',
    ],
  },
];

export default function BusinessPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const hasAnyChannel = Boolean(whatsappNumber || supportEmail);

  return (
    <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 p-6">
      <BackLink href="/" label="Back to plans" />

      <div>
        <div className="mb-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.09em] text-cyan-deep">
          For businesses
        </div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-ink">
          WiFi and CCTV for your store
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Built for small business owners in Ugbowo BDPA Estate. These need a quick chat, not an
          instant checkout — pricing depends on your setup.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {PACKAGES.map((pkg) => {
          const message = encodeURIComponent(`Hi, I'm interested in the ${pkg.name} package.`);
          return (
            <div key={pkg.name} className="rounded-card border-[1.5px] border-line bg-surface p-5">
              <div className="mb-1 text-[10.5px] font-bold uppercase tracking-wide text-amber">
                {pkg.eyebrow}
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">{pkg.name}</h2>
              <p className="mt-1.5 text-sm text-muted">{pkg.description}</p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-muted">
                {pkg.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              {hasAnyChannel ? (
                <div className="mt-4 flex gap-2">
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${message}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-btn bg-navy py-2.5 text-center text-sm font-bold text-white"
                    >
                      Get a quote
                    </a>
                  )}
                  {supportEmail && !whatsappNumber && (
                    <a
                      href={`mailto:${supportEmail}?subject=${message}`}
                      className="flex-1 rounded-btn bg-navy py-2.5 text-center text-sm font-bold text-white"
                    >
                      Get a quote
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-xs text-muted">
                  Contact details coming soon — check back shortly.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
