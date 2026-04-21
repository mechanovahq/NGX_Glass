'use client';

import { useState, useEffect } from 'react';
import { isMarketOpen, watTimeString, watWeekday, nextOpenLabel } from '@/lib/utils/marketTime';

export interface MarketClock {
  timeStr: string;
  weekday: string;
  isOpen: boolean;
  nextOpen: string;
}

export function useMarketClock(): MarketClock {
  const [clock, setClock] = useState<MarketClock>({
    timeStr: '',
    weekday: '',
    isOpen: false,
    nextOpen: '',
  });

  useEffect(() => {
    function tick() {
      setClock({
        timeStr: watTimeString(),
        weekday: watWeekday(),
        isOpen: isMarketOpen(),
        nextOpen: nextOpenLabel(),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return clock;
}
