'use client';

import { useState } from 'react';

export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t border-line dark:border-line-dark">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-line py-6 dark:border-line-dark">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-start gap-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="flex-1 font-sans text-lg font-bold text-ink dark:text-white">{item.q}</span>
              <span className="shrink-0 font-display text-2xl leading-none text-brand-blue">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <p className="animate-fade-slide-in mt-3.5 max-w-[70ch] font-sans text-[17px] leading-relaxed text-muted dark:text-white/55">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
