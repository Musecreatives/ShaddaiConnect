import type { Metadata } from 'next';
import { fontVariables } from '@shaddai/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shaddai Admin',
  description: 'Admin console for Shaddai Comm Ventures.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">{children}</body>
    </html>
  );
}
