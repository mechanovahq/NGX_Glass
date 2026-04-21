'use client';

import useSWR from 'swr';
import { useStocks } from '@/context/StocksContext';
import { useMarketClock } from './useMarketClock';

interface PriceUpdate {
  sym: string;
  price: number;
  change: number;
  changePct: number;
}

interface PricesResponse {
  result: PriceUpdate[];
  updated: string;
  count: number;
  asi?: number;
  asiChange?: number;
  asiChangePct?: number;
  turnover?: string;
  sharesTraded?: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useLivePrices() {
  const { dispatch } = useStocks();
  const { isOpen } = useMarketClock();

  useSWR<PricesResponse>('/api/prices', fetcher, {
    refreshInterval: isOpen ? 60_000 : 300_000,
    revalidateOnFocus: false,
    onSuccess(data) {
      if (!data?.result?.length) return;
      dispatch({
        type: 'UPDATE_PRICES',
        payload: data.result.map(u => ({
          sym: u.sym,
          price: u.price,
          day: u.changePct,
          up: u.changePct >= 0,
        })),
      });
      dispatch({
        type: 'UPDATE_MARKET_STATS',
        payload: {
          asi: data.asi ?? null,
          asiChange: data.asiChange ?? null,
          asiChangePct: data.asiChangePct ?? null,
          turnover: data.turnover ?? null,
          sharesTraded: data.sharesTraded ?? null,
          updated: data.updated ?? null,
        },
      });
    },
  });
}
