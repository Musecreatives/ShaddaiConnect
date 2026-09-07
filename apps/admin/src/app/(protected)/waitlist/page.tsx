import { NotifyImportedButton } from '@/components/NotifyImportedButton';
import { NotifyWaitlistButton } from '@/components/NotifyWaitlistButton';
import { WaitlistImportForm } from '@/components/WaitlistImportForm';
import { getWaitlistServer } from '@/lib/server-api';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function WaitlistPage() {
  const entries = await getWaitlistServer();
  const pendingLaunchCount = entries.filter((e) => !e.notifiedAt && e.email).length;
  const pendingConfirmationCount = entries.filter((e) => !e.confirmationSentAt && e.email).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Waitlist</h1>
          <p className="mt-1 text-sm text-muted">{entries.length} total signups.</p>
        </div>
        <div className="flex items-center gap-3">
          <WaitlistImportForm />
          <NotifyImportedButton pendingCount={pendingConfirmationCount} />
          <NotifyWaitlistButton pendingCount={pendingLaunchCount} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-page text-[11px] uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Confirmed</th>
              <th className="px-4 py-3 font-semibold">Launch notified</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-semibold text-ink">
                  {entry.name ?? <span className="font-normal text-muted">—</span>}
                </td>
                <td className="px-4 py-3 text-muted">{entry.email ?? entry.phone ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{entry.locationNote ?? '—'}</td>
                <td className="px-4 py-3 capitalize text-muted">{entry.source}</td>
                <td className="px-4 py-3">
                  {entry.confirmationSentAt ? (
                    <span className="rounded-full bg-success-tint px-2.5 py-1 text-[10.5px] font-bold uppercase text-success">
                      Sent
                    </span>
                  ) : (
                    <span className="rounded-full bg-page px-2.5 py-1 text-[10.5px] font-bold uppercase text-muted">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {entry.notifiedAt ? (
                    <span className="rounded-full bg-success-tint px-2.5 py-1 text-[10.5px] font-bold uppercase text-success">
                      Sent
                    </span>
                  ) : (
                    <span className="rounded-full bg-page px-2.5 py-1 text-[10.5px] font-bold uppercase text-muted">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(entry.createdAt)}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                  No waitlist signups yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
