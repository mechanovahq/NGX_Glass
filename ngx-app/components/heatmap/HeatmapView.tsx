'use client';

import { useState, useMemo } from 'react';
import { useStocks } from '@/context/StocksContext';
import StockLogo from '@/components/shared/StockLogo';
import PricePill from '@/components/shared/PricePill';
import HeatmapBubbleCanvas from './HeatmapBubbleCanvas';
import { SECTOR_DATA } from '@/lib/data/sectorData';

const SECTOR_MAP: Record<string, string> = {
  banking: 'Banking', industrial: 'Industrial', telecoms: 'Telecoms',
  oil: 'Oil & Gas', consumer: 'Consumer', insurance: 'Insurance',
};

export default function HeatmapView() {
  const { stocks, marketStats } = useStocks();
  const [bubbleFilter, setBubbleFilter] = useState('all');

  const filteredForBubble = useMemo(() => {
    if (bubbleFilter === 'all') return stocks;
    const sec = SECTOR_MAP[bubbleFilter];
    return stocks.filter(s => s.sec === sec);
  }, [stocks, bubbleFilter]);

  const gainers = useMemo(() => [...stocks].filter(s => s.day > 0).sort((a,b) => b.day - a.day).slice(0, 20), [stocks]);
  const losers  = useMemo(() => [...stocks].filter(s => s.day < 0).sort((a,b) => a.day - b.day).slice(0, 20), [stocks]);

  const sectorBreakdown = useMemo(() => {
    const map: Record<string, { stocks: typeof stocks; gainers: number; losers: number }> = {};
    stocks.forEach(s => {
      if (!map[s.sec]) map[s.sec] = { stocks: [], gainers: 0, losers: 0 };
      map[s.sec].stocks.push(s);
      if (s.day > 0) map[s.sec].gainers++;
      if (s.day < 0) map[s.sec].losers++;
    });
    return Object.entries(map).sort((a, b) => b[1].stocks.length - a[1].stocks.length);
  }, [stocks]);

  return (
    <div id="heatmap-view">
      <div className="page-header">
        <div>
          <div className="page-title">NGX Sector Heatmap</div>
          <div className="page-meta">
            {marketStats.updated
              ? `As of ${new Date(marketStats.updated).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' })}`
              : 'Sector performance — Apr 2026'}
          </div>
        </div>
      </div>

      {/* Sector Tiles */}
      <div className="heatmap-grid" style={{ marginBottom: 18 }}>
        {SECTOR_DATA.map(s => {
          const up = s.p >= 0;
          const intensity = Math.min(Math.abs(s.p) / 12, 1);
          const bg = up
            ? `rgba(74,157,124,${0.05 + intensity * 0.14})`
            : `rgba(197,86,62,${0.05 + intensity * 0.14})`;
          const barColor = up ? 'var(--pos)' : 'var(--neg)';
          const barW = Math.min(Math.abs(s.p) / 12 * 100, 100);
          return (
            <div key={s.n} className="sector-tile" style={{ background: bg, borderColor: up ? 'rgba(74,157,124,0.2)' : 'rgba(197,86,62,0.2)' }}>
              <div className="sector-tile-name">{s.n}</div>
              <div className={`sector-tile-pct ${up ? 'up' : 'dn'}`}>{up ? '+' : ''}{s.p}%</div>
              <div className="sector-tile-meta">{s.stocks} stocks · Cap: {s.cap}</div>
              <div className="sector-tile-bar" style={{ background: barColor, width: barW + '%', opacity: 0.6 }} />
            </div>
          );
        })}
      </div>

      {/* Bubble Canvas */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <div className="panel-title">Stock Bubble Map</div>
        </div>
        <div className="bubble-filter-row">
          {['all', 'banking', 'industrial', 'telecoms', 'oil', 'consumer', 'insurance'].map(f => (
            <button
              key={f}
              className={`bfbtn${bubbleFilter === f ? ' active' : ''}`}
              onClick={() => setBubbleFilter(f)}
            >
              {f === 'all' ? 'All Stocks' : SECTOR_MAP[f] || f}
            </button>
          ))}
        </div>
        <HeatmapBubbleCanvas stocks={filteredForBubble} />
      </div>

      {/* Gainers/Losers Tables */}
      <div className="two-col">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Top Gainers</div></div>
          <table className="eq-table">
            <thead><tr><th>#</th><th>Symbol</th><th>Company</th><th className="r">Price</th><th className="r">Day %</th><th className="r">Volume</th><th className="r">Cap</th></tr></thead>
            <tbody>
              {gainers.map((s, i) => (
                <tr key={s.sym}>
                  <td style={{ color: 'var(--muted)', fontSize: 10.5 }}>{i + 1}</td>
                  <td className="sym-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StockLogo sym={s.sym} sec={s.sec} size={24} />
                      <div><div>{s.sym}</div><div className="sub">{s.sec}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--muted-2)' }}>{s.co}</td>
                  <td className="r">₦{s.price.toLocaleString()}</td>
                  <td className="r"><PricePill value={s.day} /></td>
                  <td className="r">{s.vol}</td>
                  <td className="r" style={{ color: 'var(--muted)' }}>{s.capN}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">Top Losers</div></div>
          <table className="eq-table">
            <thead><tr><th>#</th><th>Symbol</th><th>Company</th><th className="r">Price</th><th className="r">Day %</th><th className="r">Volume</th><th className="r">Cap</th></tr></thead>
            <tbody>
              {losers.map((s, i) => (
                <tr key={s.sym}>
                  <td style={{ color: 'var(--muted)', fontSize: 10.5 }}>{i + 1}</td>
                  <td className="sym-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StockLogo sym={s.sym} sec={s.sec} size={24} />
                      <div><div>{s.sym}</div><div className="sub">{s.sec}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--muted-2)' }}>{s.co}</td>
                  <td className="r">₦{s.price.toLocaleString()}</td>
                  <td className="r"><PricePill value={s.day} /></td>
                  <td className="r">{s.vol}</td>
                  <td className="r" style={{ color: 'var(--muted)' }}>{s.capN}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Breakdown Table */}
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header"><div className="panel-title">Sector Breakdown</div></div>
        <table className="eq-table">
          <thead>
            <tr><th>Sector</th><th className="r">Stocks</th><th className="r">Avg Day %</th><th className="r">Avg YTD %</th><th className="r">Est. Cap</th><th className="r">Gainers</th><th className="r">Losers</th></tr>
          </thead>
          <tbody>
            {sectorBreakdown.map(([sec, d]) => {
              const avgDay = (d.stocks.reduce((s, x) => s + x.day, 0) / d.stocks.length).toFixed(2);
              const avgYtd = (d.stocks.reduce((s, x) => s + x.ytd, 0) / d.stocks.length).toFixed(1);
              const totalCap = d.stocks.reduce((s, x) => s + x.capV, 0);
              const capStr = totalCap >= 1000 ? '₦' + (totalCap / 1000).toFixed(1) + 'T' : '₦' + totalCap + 'B';
              return (
                <tr key={sec}>
                  <td style={{ fontWeight: 600 }}>{sec}</td>
                  <td className="r">{d.stocks.length}</td>
                  <td className="r"><span className={+avgDay >= 0 ? 'up' : 'dn'}>{+avgDay >= 0 ? '+' : ''}{avgDay}%</span></td>
                  <td className="r"><span className={+avgYtd >= 0 ? 'up' : 'dn'}>{+avgYtd >= 0 ? '+' : ''}{avgYtd}%</span></td>
                  <td className="r" style={{ color: 'var(--muted-2)' }}>{capStr}</td>
                  <td className="r" style={{ color: 'var(--pos)' }}>{d.gainers}</td>
                  <td className="r" style={{ color: 'var(--neg)' }}>{d.losers}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
