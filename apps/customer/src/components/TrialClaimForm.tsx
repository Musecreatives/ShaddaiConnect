'use client';

import { Ticket } from '@shaddai/ui';
import { useState } from 'react';
import { ApiError, requestTrialCode, verifyTrialCode } from '@/lib/api';
import { SessionTimer } from './SessionTimer';
import { VoucherQr } from './VoucherQr';

type Step = 'details' | 'code' | 'issued';

export function TrialClaimForm() {
  const [step, setStep] = useState<Step>('details');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [locationNote, setLocationNote] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await requestTrialCode({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        locationNote: locationNote.trim(),
      });
      setStep('code');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "This phone number or email has already claimed a free trial — one per customer, but you're welcome to buy a plan below."
          : err instanceof ApiError
            ? err.message
            : 'Something went wrong sending your code. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await verifyTrialCode(email.trim(), codeInput.trim());
      setVoucherCode(result.code);
      setStep('issued');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong verifying your code.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'issued' && voucherCode) {
    return (
      <div className="flex flex-col gap-5">
        <Ticket
          code={voucherCode}
          planLabel="Free Trial"
          expiryLabel="20 minutes once you connect"
          qrSlot={<VoucherQr value={voucherCode} />}
        />
        <SessionTimer voucherCode={voucherCode} />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(voucherCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="w-full rounded-btn border-[1.5px] border-line py-3 text-[15px] font-bold text-ink transition-colors hover:border-brand-blue"
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="flex flex-col gap-4">
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>.
            Enter it below to activate your trial.
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            required
            className="rounded-btn border-[1.5px] border-line px-4 py-3 text-center font-mono text-[20px] tracking-[0.3em] outline-none focus:border-brand-blue"
          />
          <button
            type="submit"
            disabled={loading || codeInput.length !== 6}
            className="w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white disabled:opacity-35"
          >
            {loading ? 'Verifying…' : 'Verify & activate'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('details');
              setError(null);
            }}
            className="text-xs font-semibold text-muted hover:text-brand-blue-deep"
          >
            Wrong details? Go back
          </button>
        </form>
        {error && (
          <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleRequestCode} className="flex flex-col gap-3">
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name (first and last)"
          pattern="[A-Za-zÀ-ÿ'\-]{2,}(\s+[A-Za-zÀ-ÿ'\-]{2,})+"
          title="Enter your full name (first and last name)."
          required
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Gmail or Yahoo email address"
          required
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number (e.g. 08012345678)"
          required
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
        <input
          type="text"
          value={locationNote}
          onChange={(e) => setLocationNote(e.target.value)}
          placeholder="Your street or nearest landmark"
          required
          className="rounded-btn border-[1.5px] border-line px-4 py-3 text-[15px] outline-none focus:border-brand-blue"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-btn bg-navy py-3.5 text-[15px] font-bold text-white disabled:opacity-35"
        >
          {loading ? 'Sending code…' : 'Send verification code'}
        </button>
      </form>
      <p className="text-xs text-muted">
        One free trial per phone number or email — must be a real gmail.com or yahoo.com address,
        verified by code. Same coverage rules apply — make sure you can see &quot;Shaddai
        WiFi&quot; on your device first.
      </p>
      {error && (
        <p className="rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
