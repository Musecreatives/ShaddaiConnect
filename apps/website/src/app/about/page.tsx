import { PlaceholderVisual } from '@/components/PlaceholderVisual';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { CREDENTIALS, TEAM, VALUES } from '@/lib/landing-data';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata = { title: 'About — Shaddai Communications' };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const DEFAULT_ABOUT_BODY = `Shaddai Communications builds and runs the practical infrastructure and tools businesses and homes actually need — networking and CCTV, brand identity, software and websites, point-of-sale systems, musical training, and media production.

We work as one team across each of those services rather than outsourcing pieces to different vendors, so a project stays coordinated from first conversation to delivery. No long contracts, no call centre — you deal directly with the people doing the work.`;

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const aboutBody = settings.website_about_body?.trim() || DEFAULT_ABOUT_BODY;
  const aboutImage = settings.website_about_image?.trim();

  return (
    <main className="flex flex-1 flex-col bg-page text-ink dark:bg-page-dark dark:text-white">
      <SiteHeader />

      <section className="bg-linear-to-b from-navy to-brand-blue px-6 py-24 sm:px-16">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.16em] text-white/70">About us</div>
          <h1 className="max-w-[16ch] font-display text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[1.02] text-white">
            One team, several disciplines.
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-[clamp(1.05rem,1.6vw,1.3rem)] leading-relaxed text-white/85">
            Based in Ugbowo BDPA Estate, Benin City — one local team across networking, brand, software, POS, music, and media.
          </p>
        </div>
      </section>

      {aboutImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded, origin varies by environment; not worth a next/image remotePatterns config for one dynamic field
        <img src={`${API_ORIGIN}${aboutImage}`} alt="Shaddai Communications" className="h-[420px] w-full object-cover" />
      ) : (
        <PlaceholderVisual className="h-[420px] w-full" label="Team photo — pending" />
      )}

      <section className="bg-page px-6 py-22 dark:bg-page-dark sm:px-16">
        <div className="mx-auto grid w-full max-w-5xl items-start gap-12 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 font-display text-2xl font-normal text-ink dark:text-white">Who we are</h2>
            {aboutBody.split('\n\n').map((paragraph, i) => (
              <p key={i} className="max-w-xl font-sans text-[17px] leading-relaxed text-muted dark:text-white/55">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {CREDENTIALS.length > 0 && (
        <section className="border-t border-line bg-[#EAF2F6] px-6 py-22 dark:border-line-dark dark:bg-surface-dark sm:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-10 text-center font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-normal leading-[1.1] text-ink dark:text-white">
              Certified across the disciplines we sell
            </h2>
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {CREDENTIALS.map((c) => (
                <div key={c} className="rounded-frame border border-line bg-surface p-7 text-center dark:border-line-dark dark:bg-page-dark">
                  <PlaceholderVisual className="mx-auto mb-4 h-16 w-16 rounded-lg" />
                  <div className="font-sans text-sm font-bold text-ink dark:text-white">{c}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-page px-6 py-22 dark:border-line-dark dark:bg-page-dark sm:px-16">
        <div className="mx-auto grid w-full max-w-6xl gap-12 sm:grid-cols-[280px_1fr] sm:items-start">
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.75rem)] font-normal leading-[1.08] text-ink dark:text-white">
            Our values
          </h2>
          <div className="flex flex-col">
            {VALUES.map((v) => (
              <div key={v.name} className="border-b border-line py-7 first:pt-0 last:border-0 dark:border-line-dark">
                <h3 className="mb-2.5 font-sans text-xl font-bold text-ink dark:text-white">{v.name}</h3>
                <p className="max-w-2xl font-sans text-[17px] leading-relaxed text-muted dark:text-white/55">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-[#FBFCFD] px-6 py-22 dark:border-line-dark dark:bg-page-dark sm:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="mb-10 font-display text-[clamp(1.9rem,3.6vw,2.75rem)] font-normal leading-[1.08] text-ink dark:text-white">
            Our team
          </h2>
          {TEAM.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {TEAM.map((t) => (
                <div key={t.name}>
                  <PlaceholderVisual className="mb-3.5 aspect-square w-full rounded-frame" />
                  <div className="font-sans text-base font-bold text-ink dark:text-white">{t.name}</div>
                  <div className="font-sans text-sm text-muted dark:text-white/50">{t.role}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="max-w-xl font-sans text-[17px] leading-relaxed text-muted dark:text-white/55">
              Individual profiles are on the way — for now, every project is staffed by the same
              small, direct team you&apos;ll speak to when you reach out.
            </p>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
