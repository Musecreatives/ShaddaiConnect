import { SiteSettingsForm } from '@/components/SiteSettingsForm';
import { getSiteSettingsServer } from '@/lib/server-api';

export default async function SiteContentPage() {
  const settings = await getSiteSettingsServer();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Site Content</h1>
        <p className="mt-1 text-sm text-muted">
          Wording on the public buy site. Changes go live immediately — no deploy needed.
        </p>
      </div>

      <div className="rounded-card border border-line bg-surface p-5">
        <SiteSettingsForm initial={settings} />
      </div>
    </div>
  );
}
