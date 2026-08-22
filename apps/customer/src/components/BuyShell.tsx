import Image from 'next/image';

const COVERAGE = ['21st Street', '22nd Street', 'Robinson Avenue', 'Ugiagbe Street', '24th Street (Soon)'];

// Below lg, this renders nothing and pages keep their existing single-column mobile layout —
// the funnel itself was already redesigned for mobile. This only fills the empty space desktop
// browsers were showing around that mobile-width column.
export function BuyShell({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`flex min-h-screen flex-1 flex-col lg:flex-row ${dark ? 'lg:bg-navy' : 'lg:bg-page'}`}>
      <aside className="relative hidden shrink-0 flex-col justify-between overflow-hidden bg-navy px-14 py-16 text-white lg:flex lg:w-[42%]">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(46,117,196,0.16), transparent 60%)' }}
        />
        <a
          href="https://shaddaicommunications.com"
          className="relative z-10 flex items-center gap-2.5"
        >
          <Image src="/logo.png" alt="Shaddai WiFi" width={32} height={32} className="shrink-0" />
          <span className="font-display text-base font-bold">Shaddai Communications</span>
        </a>

        <div className="relative z-10">
          <div className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-brand-blue-light">
            Get online
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Fast, affordable community WiFi for Ugbowo BDPA Estate.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            No contracts, no fibre wait — buy a voucher, enter the code, get online. Built for the
            estate, one street at a time.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {COVERAGE.map((area) => (
              <span
                key={area}
                className="rounded-lg bg-white/8 px-2.5 py-1 text-xs font-medium text-brand-blue-light"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/35">© 2026 Shaddai Comm Ventures</div>
      </aside>

      <div className="flex flex-1 items-start justify-center px-0 py-0 lg:items-center lg:overflow-y-auto lg:px-10 lg:py-16">
        {children}
      </div>
    </div>
  );
}
