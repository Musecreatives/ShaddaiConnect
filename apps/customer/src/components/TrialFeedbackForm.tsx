'use client';

import { useState } from 'react';
import { ApiError, submitTrialFeedback, type TrialFeedbackInput } from '@/lib/api';

const SIGNAL_OPTIONS: { value: NonNullable<TrialFeedbackInput['signalQuality']>; label: string }[] = [
  { value: 'excellent', label: 'Excellent — fast and steady' },
  { value: 'good', label: 'Good — worked fine' },
  { value: 'weak', label: 'Weak — kept dropping or slow' },
  { value: 'no_connection', label: "Couldn't really connect" },
];

const BUY_OPTIONS: { value: NonNullable<TrialFeedbackInput['wouldBuy']>; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' },
];

export function TrialFeedbackForm({ code }: { code: string }) {
  const [signalQuality, setSignalQuality] = useState<TrialFeedbackInput['signalQuality']>();
  const [wouldBuy, setWouldBuy] = useState<TrialFeedbackInput['wouldBuy']>();
  const [locationNote, setLocationNote] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitTrialFeedback(code, {
        signalQuality,
        wouldBuy,
        locationNote: locationNote.trim() || undefined,
        comments: comments.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong sending your feedback. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-line bg-success-tint px-5 py-6 text-center">
        <p className="font-display text-base font-semibold text-ink">Thanks — that really helps.</p>
        <p className="mt-1 text-sm text-muted">
          We use this to decide where to improve coverage next.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-ink">How was the connection?</legend>
        {SIGNAL_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-3 rounded-btn border-[1.5px] border-line px-4 py-3 text-sm text-ink transition-colors has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-light/20"
          >
            <input
              type="radio"
              name="signalQuality"
              value={opt.value}
              checked={signalQuality === opt.value}
              onChange={() => setSignalQuality(opt.value)}
              className="accent-brand-blue"
            />
            {opt.label}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-ink">Would you buy a plan?</legend>
        <div className="flex gap-2">
          {BUY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex flex-1 cursor-pointer items-center justify-center rounded-btn border-[1.5px] border-line px-3 py-3 text-sm font-semibold text-ink transition-colors has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-light/20"
            >
              <input
                type="radio"
                name="wouldBuy"
                value={opt.value}
                checked={wouldBuy === opt.value}
                onChange={() => setWouldBuy(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="locationNote">
          Which street or landmark were you at?
        </label>
        <input
          id="locationNote"
          type="text"
          value={locationNote}
          onChange={(e) => setLocationNote(e.target.value)}
          placeholder="e.g. 21st Street, near RCF"
          className="w-full rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink" htmlFor="comments">
          Anything else? (optional)
        </label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="w-full rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white disabled:opacity-35"
      >
        {loading ? 'Sending…' : 'Send feedback'}
      </button>

      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
