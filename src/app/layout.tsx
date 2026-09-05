import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/components/I18nProvider';
import { StoreProvider } from '@/lib/store';
import { SessionProvider } from 'next-auth/react';
import { DashboardProvider } from '@/lib/orchestration';
import { QueryProvider } from '@/lib/query/QueryProvider';

export const metadata: Metadata = {
  title: 'Arche Gym - Ironpulse Management Portal',
  description: 'Sign in to Arche Gym Ironpulse Management Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <StoreProvider>
          <SessionProvider>
            <QueryProvider>
              <I18nProvider>
                <DashboardProvider>{children}</DashboardProvider>
              </I18nProvider>
            </QueryProvider>
          </SessionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
