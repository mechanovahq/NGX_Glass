'use client';

import { useMarketClock } from '@/hooks/useMarketClock';

export default function MarketBanner() {
  const { timeStr, weekday, isOpen, nextOpen } = useMarketClock();

  return (
    <div className="market-banner">
      <div className="banner-left">
        <span className="banner-exchange">Nigerian Exchange (NGX)</span>
        <span className="banner-sep">·</span>
        <span className={`banner-status ${isOpen ? 'open' : 'closed'}`}>
          <span className={`status-dot ${isOpen ? 'open' : 'closed'}`} style={{ display: 'inline-block', marginRight: 5 }} />
          {isOpen ? 'Live' : 'Closed'}
        </span>
        {!isOpen && nextOpen && (
          <span className="banner-next">Opens {nextOpen}</span>
        )}
      </div>
      <div className="banner-right">
        <span className="banner-time">{timeStr}</span>
        <span className="banner-sep">·</span>
        <span style={{ color: 'var(--muted)' }}>{weekday}</span>
      </div>
    </div>
  );
}
