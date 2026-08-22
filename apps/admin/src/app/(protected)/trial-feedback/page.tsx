import { getTrialFeedbackServer } from '@/lib/server-api';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

const SIGNAL_LABEL: Record<string, string> = {
  excellent: 'Excellent signal',
  good: 'Good signal',
  weak: 'Weak signal',
  no_connection: "Couldn't connect",
};

const SIGNAL_BADGE: Record<string, string> = {
  excellent: 'bg-success-tint text-success',
  good: 'bg-success-tint text-success',
  weak: 'bg-amber-tint text-amber',
  no_connection: 'bg-danger-tint text-danger',
};

const BUY_LABEL: Record<string, string> = { yes: 'Would buy', maybe: 'Might buy', no: "Wouldn't buy" };
const BUY_BADGE: Record<string, string> = {
  yes: 'bg-success-tint text-success',
  maybe: 'bg-amber-tint text-amber',
  no: 'bg-danger-tint text-danger',
};

export default async function TrialFeedbackPage() {
  const feedback = await getTrialFeedbackServer();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Trial Feedback</h1>
        <p className="mt-1 text-sm text-muted">
          {feedback.length} response{feedback.length === 1 ? '' : 's'} — real signal on where
          coverage needs work.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {feedback.map((f) => (
          <div
            key={f.id}
            className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 sm:flex-row sm:items-start sm:gap-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-brand-blue-light/20 text-brand-blue-deep">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-ink">{f.voucherCode ?? '—'}</span>
                <span className="text-xs text-muted">{formatDate(f.createdAt)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {f.signalQuality && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${SIGNAL_BADGE[f.signalQuality]}`}
                  >
                    {SIGNAL_LABEL[f.signalQuality]}
                  </span>
                )}
                {f.wouldBuy && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase ${BUY_BADGE[f.wouldBuy]}`}
                  >
                    {BUY_LABEL[f.wouldBuy]}
                  </span>
                )}
                {f.locationNote && (
                  <span className="rounded-full bg-page px-2.5 py-1 text-[10.5px] font-semibold text-muted">
                    {f.locationNote}
                  </span>
                )}
              </div>
              {f.comments && <p className="mt-2 text-sm leading-relaxed text-muted">{f.comments}</p>}
            </div>
          </div>
        ))}
        {feedback.length === 0 && (
          <div className="rounded-card border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
            No trial feedback yet.
          </div>
        )}
      </div>
    </div>
  );
}
