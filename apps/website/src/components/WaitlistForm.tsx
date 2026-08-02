'use client';

import { useState } from 'react';
import { ApiError, joinWaitlist } from '@/lib/api';

export function WaitlistForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationNote, setLocationNote] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await joinWaitlist({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        locationNote: locationNote.trim() || undefined,
      });
      setJoined(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong joining the waitlist. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (joined) {
    return (
      <div className="animate-fade-slide-in rounded-frame border-[1.5px] border-success/30 bg-success-tint px-6 py-5 text-center text-[15px] font-medium text-ink">
        You&apos;re on the list — we&apos;ll email you the moment we launch in your area.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-frame border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(13,19,33,.04),0_22px_44px_-14px_rgba(13,19,33,.20)]"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
        <input
          type="text"
          value={locationNote}
          onChange={(e) => setLocationNote(e.target.value)}
          placeholder="Which street or landmark? e.g. 21st Street, near RCF"
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
      </div>
      <button
        type="submit"
        disabled={loading || (!email.trim() && !phone.trim())}
        className="mt-1 w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-navy-2 disabled:opacity-35 disabled:hover:translate-y-0"
      >
        {loading ? 'Joining…' : 'Join the waitlist'}
      </button>
      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
