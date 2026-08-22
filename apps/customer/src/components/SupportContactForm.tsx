'use client';

import { useState } from 'react';
import { ApiError, sendSupportContact } from '@/lib/api';

export function SupportContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendSupportContact({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong sending your message. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-card border-[1.5px] border-success/30 bg-success-tint px-4 py-3.5 text-sm text-ink">
        Message sent — we&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="How can we help?"
        required
        rows={4}
        className="rounded-card border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white disabled:opacity-35"
      >
        {loading ? 'Sending…' : 'Send message'}
      </button>
      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
