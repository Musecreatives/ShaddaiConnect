'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NEEDS } from '@/lib/landing-data';

export function ContactTabs() {
  const [tab, setTab] = useState<'org' | 'careers'>('org');

  return (
    <div>
      <div className="mb-9 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setTab('org')}
          className={`px-4.5 py-3 font-sans text-[17px] font-bold transition-colors ${
            tab === 'org' ? 'border-b-2 border-brand-blue text-ink dark:text-white' : 'text-muted dark:text-white/40'
          }`}
        >
          For organisations
        </button>
        <button
          type="button"
          onClick={() => setTab('careers')}
          className={`px-4.5 py-3 font-sans text-[17px] font-bold transition-colors ${
            tab === 'careers' ? 'border-b-2 border-brand-blue text-ink dark:text-white' : 'text-muted dark:text-white/40'
          }`}
        >
          Careers &amp; partners
        </button>
      </div>

      {tab === 'org' ? (
        // No backend endpoint exists for this form yet — matches the imported design's own mock
        // (onSubmit prevents default) rather than pretending to submit anywhere real.
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid gap-5 rounded-frame border border-line bg-page p-10 dark:border-line-dark dark:bg-surface-dark sm:grid-cols-2"
        >
          <label className="flex flex-col gap-2 font-sans text-sm font-bold text-ink dark:text-white">
            First name *
            <input type="text" placeholder="e.g. John" className="rounded-btn border border-line bg-surface px-4 py-3.5 font-sans text-[15px] font-medium text-ink dark:border-line-dark dark:bg-page-dark dark:text-white" />
          </label>
          <label className="flex flex-col gap-2 font-sans text-sm font-bold text-ink dark:text-white">
            Last name *
            <input type="text" placeholder="e.g. Doe" className="rounded-btn border border-line bg-surface px-4 py-3.5 font-sans text-[15px] font-medium text-ink dark:border-line-dark dark:bg-page-dark dark:text-white" />
          </label>
          <label className="col-span-full flex flex-col gap-2 font-sans text-sm font-bold text-ink dark:text-white sm:col-span-1">
            Email *
            <input type="email" placeholder="name@example.com" className="rounded-btn border border-line bg-surface px-4 py-3.5 font-sans text-[15px] font-medium text-ink dark:border-line-dark dark:bg-page-dark dark:text-white" />
          </label>
          <label className="flex flex-col gap-2 font-sans text-sm font-bold text-ink dark:text-white">
            Phone
            <input type="tel" placeholder="080..." className="rounded-btn border border-line bg-surface px-4 py-3.5 font-sans text-[15px] font-medium text-ink dark:border-line-dark dark:bg-page-dark dark:text-white" />
          </label>

          <div className="col-span-full">
            <div className="mb-3.5 font-sans text-sm font-bold text-ink dark:text-white">What do you need? *</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {NEEDS.map((n) => (
                <label
                  key={n}
                  className="flex items-center gap-2.5 rounded-btn border border-line bg-surface px-4 py-3.5 font-sans text-sm font-medium text-ink dark:border-line-dark dark:bg-page-dark dark:text-white/85"
                >
                  <input type="checkbox" className="h-4.5 w-4.5 accent-brand-blue" />
                  {n}
                </label>
              ))}
            </div>
          </div>

          <label className="col-span-full flex flex-col gap-2 font-sans text-sm font-bold text-ink dark:text-white">
            Anything else we should know?
            <textarea
              rows={5}
              placeholder="Tell us a bit more about what you need"
              className="rounded-btn border border-line bg-surface px-4 py-3.5 font-sans text-[15px] font-medium text-ink dark:border-line-dark dark:bg-page-dark dark:text-white"
            />
          </label>

          <div className="col-span-full flex justify-center">
            <button type="submit" className="rounded-full bg-navy px-11 py-4 font-sans text-[15px] font-bold text-white transition-colors hover:bg-brand-blue">
              Submit
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-frame border border-line bg-page p-10 text-center dark:border-line-dark dark:bg-surface-dark">
          <p className="font-sans text-[17px] leading-relaxed text-muted dark:text-white/60">
            Looking to partner with us, or join the team? See open roles on the{' '}
            <Link href="/careers" className="font-bold text-brand-blue underline">
              Careers
            </Link>{' '}
            page, or email us directly at{' '}
            <a href="mailto:support@shaddaicommunications.com" className="font-bold text-brand-blue underline">
              support@shaddaicommunications.com
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
