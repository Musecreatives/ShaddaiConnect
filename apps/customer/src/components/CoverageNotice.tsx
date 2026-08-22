'use client';

import { COVERAGE_AREAS } from '@/lib/coverage';

export function CoverageNotice({
  confirmed,
  onChange,
}: {
  confirmed: boolean;
  onChange: (confirmed: boolean) => void;
}) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand-blue-deep">
        Before you buy
      </div>
      <p className="text-sm text-ink">
        Shaddai WiFi only reaches within Ugbowo BDPA Estate. Vouchers are non-refundable once
        issued, including if your device turns out to be out of range — please confirm first.
      </p>

      {COVERAGE_AREAS.length > 0 ? (
        <div className="mt-2.5">
          <p className="text-xs font-semibold text-ink">Covered areas:</p>
          <ul className="mt-1 list-inside list-disc text-xs text-muted">
            {COVERAGE_AREAS.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2.5 text-xs text-muted">
          A detailed coverage map is coming soon. For now, check your device&apos;s WiFi list for
          &quot;Shaddai WiFi&quot; — if you can see and join it, you&apos;re in range.
        </p>
      )}

      <label className="mt-3 flex items-start gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-brand-blue-deep"
        />
        I can see &quot;Shaddai WiFi&quot; on my device and I&apos;m within the coverage area
        above.
      </label>
    </div>
  );
}
