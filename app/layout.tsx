import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from 'next-themes';
import { Providers } from './providers';
import { LanguageProvider } from '@/lib/language-context';
import { ConnectionStatus } from '@/components/ConnectionStatus';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WebTrader',
  description: 'Trading platform for stocks, bonds and mutual funds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <div className="container mx-auto px-4 py-2">
                  <ConnectionStatus />
                </div>
                <main className="flex-1">{children}</main>
                <Toaster />
              </div>
            </LanguageProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
