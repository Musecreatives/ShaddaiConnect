import type { Metadata } from 'next';
import { fontVariables } from '@shaddai/ui';
import './globals.css';

const SITE_URL = 'https://www.shaddaicommunications.com';
const TITLE = 'Shaddai Communications — Community WiFi, Ugbowo BDPA Estate';
const DESCRIPTION =
  'Fast, affordable WiFi for Ugbowo BDPA Estate, Benin City. Join the waitlist to be first online when we reach your street.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s — Shaddai Communications',
  },
  description: DESCRIPTION,
  keywords: [
    'WiFi Benin City',
    'internet Ugbowo',
    'BDPA Estate WiFi',
    'community internet Nigeria',
    'Starlink installation Benin City',
    'hotspot voucher',
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
  '@type': 'InternetServiceProvider',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
        />
      </body>
    </html>
  );
}
