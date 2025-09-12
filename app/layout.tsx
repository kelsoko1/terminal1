import './globals.css';
import '@/styles/mobile-investors.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { Providers } from './providers';
import { LanguageProvider } from '@/lib/language-context';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import dynamic from 'next/dynamic';
import { FuturesContractsProvider } from '@/contexts/FuturesContractsContext'


// Dynamically import components to avoid SSR issues
const SubscriptionPrompt = dynamic(
  () => import('@/components/subscription/SubscriptionPrompt'),
  { ssr: false }
);

const SubscriptionInitializer = dynamic(
  () => import('@/components/subscription/SubscriptionInitializer'),
  { ssr: false }
);

const MobileNavigation = dynamic(
  () => import('@/components/MobileNavigation').then(mod => ({ default: mod.MobileNavigation })),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'kelsoko',
  description: 'Trading platform for stocks, bonds and mutual funds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <FuturesContractsProvider>
                <div className="min-h-screen flex flex-col safe-area-inset">
                  <div className="safe-area-top">
                    <Header />
                  </div>
                  <div className="mobile-container py-2">
                    <ConnectionStatus />
                  </div>
                  <main className="flex-1">{children}</main>
                  <Toaster />
                  <SubscriptionPrompt />
                  <SubscriptionInitializer />
                  <MobileNavigation />
                </div>
              </FuturesContractsProvider>
            </LanguageProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
