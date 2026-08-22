'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'How do I know if I’m in range?',
    a: 'Check your phone or laptop’s WiFi list for a network called "Shaddai WiFi." If you can see it, you’re in range. Not seeing it yet? Join the waitlist and we’ll email you the moment we reach your street.',
  },
  {
    q: 'How much does it cost?',
    a: 'Hourly vouchers start from ₦1,200, with weekly and monthly plans also available — see the pricing above. First time? Try 20 minutes free before you buy.',
  },
  {
    q: 'How many devices can I connect?',
    a: 'Depends on the plan — most vouchers cover 1 device, with 2-device options for shared households. Check the buy page for the full list once you’re live.',
  },
  {
    q: 'Do I need to install an app?',
    a: 'No. Connect to the WiFi network, enter your voucher code on the login page that appears, and you’re online. No app, no account.',
  },
  {
    q: 'What if my area isn’t covered yet?',
    a: 'Join the waitlist with your street or nearest landmark — it directly shapes where we expand next.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {FAQS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className="rounded-frame border border-line-dark bg-surface-dark">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-display text-sm font-semibold text-white">{item.q}</span>
              <span
                className={`shrink-0 text-lg text-brand-blue-light transition-transform duration-150 ${open ? 'rotate-45' : ''}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {open && (
              <p className="animate-fade-slide-in px-5 pb-4 text-sm text-white/45">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
