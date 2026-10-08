import type { Metadata, Viewport } from 'next';
import '../src/index.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'EMTECH ERP v2',
  description:
    'Enterprise ERP v2 — Finance, HR, Procurement, Inventory, Fixed Assets and Budgeting. Fast, calm and data-clear.'
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
