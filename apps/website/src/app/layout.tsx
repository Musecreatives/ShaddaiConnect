import type { Metadata } from 'next';
import { fontVariables } from '@shaddai/ui';
import { websiteFontVariables } from '@/fonts';
import './globals.css';

const SITE_URL = 'https://www.shaddaicommunications.com';
const TITLE = 'Shaddai Communications — Local Services, Ugbowo BDPA Estate';
const DESCRIPTION =
  'Starlink installation, CCTV, brand identity, websites, software, POS tools, musical training, and media production for Ugbowo BDPA Estate, Benin City — one local team.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s — Shaddai Communications',
  },
  description: DESCRIPTION,
  keywords: [
    'Starlink installation Benin City',
    'CCTV installation Benin City',
    'website development Nigeria',
    'software development Benin City',
    'POS Nigeria',
    'music lessons Benin City',
    'podcast studio setup Nigeria',
    'motion graphics Benin City',
    'Ugbowo BDPA Estate services',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Shaddai Communications',
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_NG',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Shaddai Communications logo' }],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const LOCAL_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Shaddai Communications',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: DESCRIPTION,
  areaServed: {
    '@type': 'Place',
    name: 'Ugbowo BDPA Estate, Benin City, Edo State, Nigeria',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Benin City',
    addressRegion: 'Edo State',
    addressCountry: 'NG',
  },
};

/* Reads the saved theme before paint so there's no flash of the wrong mode on load — must run
   synchronously, before hydration, hence a plain inline script rather than a React effect. */
const THEME_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} ${websiteFontVariables} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-page text-ink dark:bg-page-dark dark:text-white font-sans">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
        />
      </body>
    </html>
  );
}
