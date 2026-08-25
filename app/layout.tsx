import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { I18nProvider } from '@/components/I18nProvider';
import { StoreProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Arche Gym - Ironpulse Management Portal',
  description: 'Sign in to Arche Gym Ironpulse Management Portal',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <StoreProvider>
          <I18nProvider>{children}</I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
