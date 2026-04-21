import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './Providers';
import Nav from '@/components/layout/Nav';
import MarketBanner from '@/components/layout/MarketBanner';
import TickerStrip from '@/components/layout/TickerStrip';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NGX Glass — Nigerian Exchange Analytics',
  description: 'Real-time NGX equities dashboard — market data, portfolio tracker, heatmap, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <Nav />
          <MarketBanner />
          <TickerStrip />
          <div className="page">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
