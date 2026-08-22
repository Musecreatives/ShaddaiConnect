import { TeamSection } from '@/components/TeamSection';
import { getAdminsServer, getSettingsServer } from '@/lib/server-api';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-mono text-sm text-ink">{value}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const [settings, admins] = await Promise.all([getSettingsServer(), getAdminsServer()]);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Current configuration. Network/support values here come from environment variables —
          edit `.env` and restart to change them. Team accounts below are live and DB-backed.
        </p>
      </div>

      <div className="rounded-card border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-ink">Network</h2>
        </div>
        <Field label="RADIUS octet direction inverted" value={String(settings.radiusInvertOctets)} />
        <Field label="Allowed browser origins (CORS)" value={settings.corsOrigins.join(', ')} />
      </div>

      <div className="rounded-card border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-ink">Customer support channels</h2>
        </div>
        <Field label="WhatsApp Business number" value={whatsapp || 'Not set'} />
        <Field label="Support email" value={supportEmail || 'Not set'} />
        {(!whatsapp || !supportEmail) && (
          <div className="border-t border-line bg-amber-tint px-4 py-3 text-xs text-ink">
            Set <code className="font-mono">NEXT_PUBLIC_WHATSAPP_NUMBER</code> and/or{' '}
            <code className="font-mono">NEXT_PUBLIC_SUPPORT_EMAIL</code> in both
            <code className="font-mono"> apps/customer/.env</code> and
            <code className="font-mono"> apps/admin/.env</code> — the customer Support page and
            this display read the same values independently.
          </div>
        )}
      </div>

      <div className="rounded-card border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-ink">Notifications</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${
              settings.ntfyConfigured ? 'bg-success-tint text-success' : 'bg-amber-tint text-amber'
            }`}
          >
            {settings.ntfyConfigured ? 'ntfy connected' : 'ntfy not configured'}
          </span>
        </div>
        <Field
          label="Admin alerts (ntfy)"
          value={settings.ntfyConfigured ? 'Self-hosted, private' : 'Not set — see NTFY_URL/NTFY_TOPIC'}
        />
        {settings.ntfyConfigured && (
          <div className="border-b border-line px-4 py-3 last:border-0">
            <div className="mb-2 text-sm text-muted">Subscribed events</div>
            <div className="flex flex-wrap gap-2">
              {['Free trial signup', 'New payment', 'Waitlist signup', 'Support message', 'Device blocked'].map(
                (event) => (
                  <span
                    key={event}
                    className="rounded-full bg-brand-blue-light/20 px-2.5 py-1 text-[11px] font-semibold text-brand-blue-deep"
                  >
                    {event}
                  </span>
                ),
              )}
            </div>
          </div>
        )}
        <Field
          label="Customer push notifications (Web Push)"
          value={settings.pushConfigured ? 'Enabled' : 'Not set — see VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY'}
        />
      </div>

      <TeamSection rootEmail={settings.adminEmail} initialAdmins={admins} />
    </div>
  );
}
