'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Stock, StocksAction, MarketStats } from '@/types/stock';
import { STOCKS as initialStocks } from '@/lib/data/stocks';

const initialMarketStats: MarketStats = {
  asi: null,
  asiChange: null,
  asiChangePct: null,
  turnover: null,
  sharesTraded: null,
  updated: null,
};

interface StocksState {
  stocks: Stock[];
  marketStats: MarketStats;
}

const StocksContext = createContext<{
  stocks: Stock[];
  marketStats: MarketStats;
  dispatch: React.Dispatch<StocksAction>;
} | null>(null);

function stocksReducer(state: StocksState, action: StocksAction): StocksState {
  switch (action.type) {
    case 'UPDATE_PRICES':
      return {
        ...state,
        stocks: state.stocks.map(s => {
          const update = action.payload.find(u => u.sym === s.sym);
          if (!update) return s;
          const capV = s.price > 0 ? +(s.capV * (update.price / s.price)).toFixed(2) : s.capV;
          return { ...s, price: update.price, day: update.day, up: update.up, capV };
        }),
      };
    case 'UPDATE_MARKET_STATS':
      return { ...state, marketStats: action.payload };
    case 'RESET':
      return { stocks: initialStocks, marketStats: initialMarketStats };
    default:
      return state;
  }
}

export function StocksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(stocksReducer, {
    stocks: initialStocks,
    marketStats: initialMarketStats,
  });
  return (
    <StocksContext.Provider value={{ stocks: state.stocks, marketStats: state.marketStats, dispatch }}>
      {children}
    </StocksContext.Provider>
  );
}

export function useStocks() {
  const ctx = useContext(StocksContext);
  if (!ctx) throw new Error('useStocks must be used within StocksProvider');
  return ctx;
}
