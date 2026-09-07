'use client';

import { useState } from 'react';

export function TestimonialCarousel({ quotes }: { quotes: { text: string; name: string; role: string }[] }) {
  const [index, setIndex] = useState(0);
  const shown = [quotes[index % quotes.length], quotes[(index + 1) % quotes.length]];

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => setIndex((i) => (i - 1 + quotes.length) % quotes.length)}
        aria-label="Previous"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-brand-blue-light dark:border-line-dark dark:text-white"
      >
        ‹
      </button>
      <div className="grid flex-1 gap-6 sm:grid-cols-2">
        {shown.map((q, i) => (
          <blockquote
            key={`${q.name}-${i}`}
            className="animate-fade-slide-in flex flex-col gap-5 rounded-frame border border-line bg-surface p-8 dark:border-line-dark dark:bg-surface-dark"
          >
            <p className="font-sans text-lg font-medium leading-relaxed text-ink dark:text-white/85">{q.text}</p>
            <div>
              <div className="font-sans text-sm font-bold text-ink dark:text-white">{q.name}</div>
              <div className="font-sans text-sm italic text-muted dark:text-white/50">{q.role}</div>
            </div>
          </blockquote>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setIndex((i) => (i + 1) % quotes.length)}
        aria-label="Next"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-brand-blue-light dark:border-line-dark dark:text-white"
      >
        ›
      </button>
    </div>
  );
}
