'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { StocksProvider } from '@/context/StocksContext';
import { useLivePrices } from '@/hooks/useLivePrices';

function LivePricesBootstrapper() {
  useLivePrices();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <StocksProvider>
        <LivePricesBootstrapper />
        {children}
      </StocksProvider>
    </ThemeProvider>
  );
}
