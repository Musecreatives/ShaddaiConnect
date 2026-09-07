import { DM_Serif_Display, Manrope } from 'next/font/google';

/**
 * Landing-page redesign (2026-09-06, Claude Design import) — this app's own display/body
 * fonts, self-hosted at build time like packages/ui/src/fonts.ts (no runtime Google Fonts
 * request). Scoped to apps/website only: these override --font-display/--font-sans in
 * globals.css for this app's Tailwind build, leaving apps/admin and apps/customer on
 * Poppins/Inter untouched.
 */
export const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const websiteFontVariables = `${dmSerifDisplay.variable} ${manrope.variable}`;
