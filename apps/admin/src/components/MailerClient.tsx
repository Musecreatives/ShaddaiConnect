'use client';

import { useState } from 'react';
import { useConfirm, useToast } from '@/components/DialogProvider';
import { PaymentGatewayIssueForm } from '@/components/PaymentGatewayIssueForm';
import { ApiError, sendMail } from '@/lib/api';

/** Prefills the composer below — not a separate send path. Add more entries here as recurring
 * one-off scenarios come up; each is just starting text the admin can edit before sending. */
const TEMPLATES: { id: string; label: string; subject: string; body: string }[] = [
  {
    id: 'apology-generic',
    label: 'General apology / follow-up',
    subject: "Following up on your Shaddai WiFi experience",
    body: "Hi,\n\nSorry for the trouble you ran into. We wanted to follow up directly and make sure it's sorted.\n\nLet us know if there's anything else we can help with.\n\nShaddai Comm Ventures",
  },
];

export function MailerClient() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    setSubject(template.subject);
    setBody(template.body);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !subject.trim() || !body.trim()) {
      toast('To, subject and body are all required.');
      return;
    }
    const ok = await confirm(`Send this email to ${to.trim()}?`, { title: 'Send email' });
    if (!ok) return;
    setSending(true);
    try {
      const { sent } = await sendMail({ to: to.trim(), subject: subject.trim(), body });
      toast(
        sent ? `Sent to ${to.trim()}.` : 'Logged but not sent — SENDGRID_API_KEY is not configured on the server.',
        sent ? 'success' : 'error',
      );
      if (sent) {
        setTo('');
        setSubject('');
        setBody('');
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to send.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Mailer</h1>
        <p className="mt-1 text-sm text-muted">
          Send a one-off email to any address — for situations the automated notifications
          (Customers page) don&apos;t cover.
        </p>
      </div>

      <div className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-3 font-display text-base font-bold text-ink">Payment gateway issue</h2>
        <p className="mb-3 text-sm text-muted">
          A ready-made, nicely formatted notice for a customer whose payment failed because of a
          known issue on our end (e.g. the payment provider account pending verification) — makes
          clear it wasn&apos;t their fault and no charge was made.
        </p>
        <PaymentGatewayIssueForm />
      </div>

      <div className="rounded-card border border-line bg-surface p-5">
        <h2 className="mb-3 font-display text-base font-bold text-ink">Compose a custom email</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className="rounded-full border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-brand-blue hover:text-brand-blue-deep"
            >
              {t.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">To</span>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="customer@example.com"
              required
              className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand-blue"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Body</span>
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the email here. Leave a blank line between paragraphs."
              required
              className="rounded-btn border-[1.5px] border-line px-3.5 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-blue"
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="self-start rounded-btn bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-40"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
