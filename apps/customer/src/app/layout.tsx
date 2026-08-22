import type { Metadata, Viewport } from 'next';
import { fontVariables } from '@shaddai/ui';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shaddai — Buy WiFi',
  description: 'Buy a WiFi voucher for Ugbowo BDPA Estate.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Shaddai WiFi',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D1B33',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
