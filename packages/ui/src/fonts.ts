import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';

/**
 * Phase 0 note (see docs/DECISIONS.md): DESIGN-SYSTEM.md §3 calls for next/font/local with
 * vendored font files. No font binaries are checked into the repo yet, so this uses
 * next/font/google instead — output is still build-time self-hosted with zero runtime
 * requests to Google, matching the "no external requests" requirement. Swap for
 * next/font/local once the font files are sourced, keeping the same `variable` names.
 *
 * Display font switched Space Grotesk -> Poppins, 2026-07-24 (site-wide brand font decision).
 */
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

/** Apply to the root <html> className in each app's layout.tsx. */
export const fontVariables = `${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`;
