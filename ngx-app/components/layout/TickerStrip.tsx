'use client';

import { useStocks } from '@/context/StocksContext';
import { useMemo } from 'react';

export default function TickerStrip() {
  const { stocks } = useStocks();

  const tickerItems = useMemo(() => {
    return [...stocks]
      .sort((a, b) => b.capV - a.capV)
      .slice(0, 24);
  }, [stocks]);

  const items = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker-strip">
      <div className="ticker-label">NGX Live</div>
      <div className="ticker-scroll">
        <div className="ticker">
          {items.map((s, i) => (
            <div key={`${s.sym}-${i}`} className="ticker-item">
              <span className="t-sym">{s.sym}</span>
              <span className="t-price">
                ₦{s.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`t-chg ${s.up ? 'up' : 'dn'}`}>
                {s.up ? '+' : ''}{s.day.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
