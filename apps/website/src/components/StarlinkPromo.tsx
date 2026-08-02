const REFERRAL_URL = 'https://starlink.com/residential?referral=RC-DF-13407982-87554-9';

// Fixed positions/delays (not Math.random() at render time) — avoids an SSR/client hydration
// mismatch, since the server and browser would otherwise roll different "random" values.
const STARS = [
  { top: '12%', left: '8%', size: 2, delay: '0s' },
  { top: '22%', left: '82%', size: 3, delay: '0.4s' },
  { top: '35%', left: '20%', size: 2, delay: '1.1s' },
  { top: '18%', left: '45%', size: 2, delay: '1.8s' },
  { top: '48%', left: '68%', size: 3, delay: '0.9s' },
  { top: '60%', left: '12%', size: 2, delay: '2.2s' },
  { top: '70%', left: '88%', size: 2, delay: '0.2s' },
  { top: '30%', left: '60%', size: 2, delay: '1.5s' },
  { top: '55%', left: '35%', size: 3, delay: '2.6s' },
  { top: '15%', left: '65%', size: 2, delay: '0.7s' },
  { top: '75%', left: '55%', size: 2, delay: '1.3s' },
  { top: '40%', left: '5%', size: 2, delay: '2s' },
];

export function StarlinkPromo() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-page-dark py-16">
      {/* Night-sky field — pure CSS, no external image/GIF asset needed. */}
      <div className="pointer-events-none absolute inset-0">
        {STARS.map((star, i) => (
          <span
            key={i}
            className="animate-twinkle absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-6 text-center">
        <div className="animate-float">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4L9 9M20 20L15 15M13.5 6.5L17.5 10.5L10.5 17.5L6.5 13.5L13.5 6.5Z"
              stroke="#8FC1E8"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx="7" cy="7" r="1.6" fill="#18C7D8" />
            <circle cx="17" cy="17" r="1.6" fill="#18C7D8" />
          </svg>
        </div>
        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.09em] text-brand-blue-light">
          Bringing satellite internet to your home
        </div>
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
          Get Starlink installed — 1 month free
        </h2>
        <p className="max-w-xl text-[15px] text-white/70">
          Want unlimited, high-speed satellite internet at home or your business? Sign up through
          our referral link and get your first month free after activation.
        </p>
        <a
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-btn bg-brand-blue px-6 py-3.5 text-[15px] font-bold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-blue-deep"
        >
          Get Starlink — claim your free month
        </a>
      </div>
    </section>
  );
}
