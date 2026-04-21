'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Stock, StocksAction } from '@/types/stock';
import { STOCKS as initialStocks } from '@/lib/data/stocks';

const StocksContext = createContext<{
  stocks: Stock[];
  dispatch: React.Dispatch<StocksAction>;
} | null>(null);

function stocksReducer(state: Stock[], action: StocksAction): Stock[] {
  switch (action.type) {
    case 'UPDATE_PRICES':
      return state.map(s => {
        const update = action.payload.find(u => u.sym === s.sym);
        if (!update) return s;
        return { ...s, price: update.price, day: update.day, up: update.up };
      });
    case 'RESET':
      return initialStocks;
    default:
      return state;
  }
}

export function StocksProvider({ children }: { children: ReactNode }) {
  const [stocks, dispatch] = useReducer(stocksReducer, initialStocks);
  return (
    <StocksContext.Provider value={{ stocks, dispatch }}>
      {children}
    </StocksContext.Provider>
  );
}

export function useStocks() {
  const ctx = useContext(StocksContext);
  if (!ctx) throw new Error('useStocks must be used within StocksProvider');
  return ctx;
}
