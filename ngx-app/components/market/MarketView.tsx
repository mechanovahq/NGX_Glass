'use client';

import { useMemo } from 'react';
import { useStocks } from '@/context/StocksContext';
import StockLogo from '@/components/shared/StockLogo';
import PricePill from '@/components/shared/PricePill';
import BubbleCanvas from './BubbleCanvas';
import StockTable from './StockTable';
import { fxData } from '@/lib/data/fxData';
import { FIXED_INCOME } from '@/lib/data/fixedIncome';
import { FULL_NEWS } from '@/lib/data/news';
import { FULL_FILINGS } from '@/lib/data/filings';

const INDICES = [
  { n: 'NGX All-Share',  sub: 'Benchmark',   v: '110,841',    d: '+0.47%', ytd: '+7.36%',  up: true  },
  { n: 'NGX 30',        sub: 'Large Cap',    v: '4,012.8',    d: '+0.31%', ytd: '+8.12%',  up: true  },
  { n: 'NGX Banking',   sub: 'Financials',   v: '1,024.40',   d: '+0.79%', ytd: '+24.82%', up: true  },
  { n: 'NGX Consumer',  sub: 'FMCG',         v: '1,847.30',   d: '+0.28%', ytd: '+9.93%',  up: true  },
  { n: 'NGX Industrial',sub: 'Cement/Mfg',   v: '4,312.60',   d: '+2.21%', ytd: '+28.4%',  up: true  },
  { n: 'NGX Insurance', sub: 'Underwriters', v: '247.80',     d: '+1.52%', ytd: '+14.34%', up: true  },
  { n: 'NGX Oil & Gas', sub: 'Energy',       v: '1,680.50',   d: '+1.84%', ytd: '+31.2%',  up: true  },
  { n: 'NGX Pension',   sub: 'Pension Funds',v: '2,190.40',   d: '+0.15%', ytd: '+32.11%', up: true  },
];

function formatUpdated(iso: string | null): string {
  if (!iso) return 'Apr 17, 2026';
  const d = new Date(iso);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' });
}

function formatCapV(billionsNGN: number): string {
  if (billionsNGN >= 1000) return '₦' + (billionsNGN / 1000).toFixed(2) + 'T';
  return '₦' + billionsNGN.toFixed(1) + 'B';
}

export default function MarketView() {
  const { stocks, marketStats } = useStocks();

  const { adv, dec, unc, topGainer } = useMemo(() => {
    const adv = stocks.filter(s => s.day > 0).length;
    const dec = stocks.filter(s => s.day < 0).length;
    const unc = stocks.filter(s => s.day === 0).length;
    const topGainer = [...stocks].filter(s => s.day > 0).sort((a, b) => b.day - a.day)[0];
    return { adv, dec, unc, topGainer };
  }, [stocks]);

  const gainers = useMemo(() => [...stocks].filter(s => s.day > 0).sort((a, b) => b.day - a.day).slice(0, 5), [stocks]);
  const losers  = useMemo(() => [...stocks].filter(s => s.day < 0).sort((a, b) => a.day - b.day).slice(0, 5), [stocks]);

  const totalCapStr = useMemo(() => {
    const total = stocks.reduce((s, x) => s + x.capV, 0);
    return formatCapV(total);
  }, [stocks]);

  const liveAsi = marketStats.asi ?? 110841;
  const liveAsiChange = marketStats.asiChange ?? 521;
  const liveAsiChangePct = marketStats.asiChangePct ?? 0.47;
  const liveTurnover = marketStats.turnover ?? '₦38.92B';
  const liveShares = marketStats.sharesTraded ?? '1.04B';
  const dateLabel = formatUpdated(marketStats.updated);
  const asiUp = liveAsiChangePct >= 0;

  return (
    <div id="market-view">

      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="live-dot" />
            NGX Market Overview
          </div>
          <div className="page-meta">
            {dateLabel} &nbsp;·&nbsp; {liveShares} shares &nbsp;·&nbsp; {liveTurnover} turnover &nbsp;·&nbsp;
            <span style={{ color: 'var(--pos)' }}>{adv} advancing</span>
            &nbsp;·&nbsp;
            <span style={{ color: 'var(--neg)' }}>{dec} declining</span>
          </div>
        </div>
        <div className="header-right">
          <div className="asi-badge">
            <span className="label">ASI</span>
            <span className="asi-val">{liveAsi.toLocaleString()}</span>
            <span className={`asi-chg ${asiUp ? 'up' : 'dn'}`}>
              {asiUp ? '▲' : '▼'} {Math.abs(liveAsiChange).toLocaleString()} ({asiUp ? '+' : ''}{liveAsiChangePct.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* FX Strip */}
      <div className="fx-strip">
        {fxData.map(f => (
          <div key={f.p} className="fx-cell">
            <span className="fx-pair">{f.p}</span>
            <span className="fx-rate">{f.r}</span>
            <span className={`fx-chg ${f.up ? 'up' : 'dn'}`}>{f.d}</span>
          </div>
        ))}
      </div>

      {/* Stat Grid */}
      <div className="stat-grid">
        {[
          { l: 'Total Mkt Cap',  v: totalCapStr,                                sub: '~$' + (parseFloat(totalCapStr.replace(/[₦TB]/g,'')) * (totalCapStr.includes('T') ? 1000 : 1) / 1600).toFixed(1) + 'B', d: `+${liveAsiChangePct.toFixed(2)}%`, up: asiUp },
          { l: '24h Turnover',   v: liveTurnover.startsWith('₦') ? liveTurnover : '₦' + liveTurnover, sub: `${adv + dec + unc} equities`, d: '', up: true },
          { l: 'Shares Traded',  v: liveShares,                                 sub: '156 equities',      d: '',       up: true  },
          { l: 'NGX ASI',        v: liveAsi.toLocaleString(),                   sub: 'YTD +7.36%',        d: `${asiUp ? '+' : ''}${liveAsiChangePct.toFixed(2)}%`, up: asiUp },
          { l: 'NGX 30',         v: '4,012.8',                                  sub: 'Large caps',        d: '+0.31%', up: true  },
          { l: 'Market Breadth', v: `${adv}↑ ${dec}↓`,                         sub: `${unc} unchanged`,  d: '',       up: adv > dec },
          { l: 'Top Gainer',     v: `+${topGainer?.day.toFixed(2) ?? '0.00'}%`, sub: `${topGainer?.sym ?? ''} ₦${topGainer?.price ?? ''}`, d: '', up: true },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.l}</div>
            <div className="stat-value">{s.v}</div>
            <div className="stat-sub">{s.sub}</div>
            {s.d && (
              <div className={`stat-badge ${s.up ? 'badge-up' : 'badge-dn'}`}>
                {s.up ? '▲' : '▼'} {s.d}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="two-col">

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Bubble Canvas */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Stock Bubble Map</div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span className="label" style={{ color: 'var(--pos)' }}>▲ Gaining</span>
                <span className="label" style={{ color: 'var(--neg)' }}>▼ Losing</span>
                <span className="label">Size = Mkt Cap</span>
              </div>
            </div>
            <BubbleCanvas />
          </div>

          {/* Top Movers */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Top Movers</div>
              <span className="panel-tag">{dateLabel}</span>
            </div>
            <div className="movers-grid">
              <div className="movers-col">
                <div className="movers-title up">Gainers</div>
                {gainers.map((s, i) => (
                  <div key={s.sym} className="mover-row">
                    <span className="mv-rank">{i + 1}</span>
                    <StockLogo sym={s.sym} sec={s.sec} size={24} />
                    <div style={{ flex: 1 }}>
                      <div className="mv-name">{s.sym}</div>
                      <div className="mv-sector">{s.sec}</div>
                    </div>
                    <div className="mv-price">₦{s.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <span className="mv-pct up">+{s.day.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
              <div className="movers-col">
                <div className="movers-title dn">Losers</div>
                {losers.map((s, i) => (
                  <div key={s.sym} className="mover-row">
                    <span className="mv-rank">{i + 1}</span>
                    <StockLogo sym={s.sym} sec={s.sec} size={24} />
                    <div style={{ flex: 1 }}>
                      <div className="mv-name">{s.sym}</div>
                      <div className="mv-sector">{s.sec}</div>
                    </div>
                    <div className="mv-price">₦{s.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <span className="mv-pct dn">{s.day.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Market Sentiment */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Market Sentiment</div>
              <span className="panel-tag">NGX Breadth</span>
            </div>
            <div className="fg-wrap">
              <div className="fg-arc">
                <svg viewBox="0 0 200 110">
                  <defs>
                    <linearGradient id="arcG" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#c5563e" />
                      <stop offset="50%"  stopColor="#c9a961" />
                      <stop offset="100%" stopColor="#4a9d7c" />
                    </linearGradient>
                  </defs>
                  <path d="M 20,100 A 80,80 0 0,1 180,100" fill="none" stroke="rgba(232,230,223,0.05)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 20,100 A 80,80 0 0,1 180,100" fill="none" stroke="url(#arcG)" strokeWidth="12" strokeLinecap="round" />
                  <g transform={`rotate(${-90 + (adv / (adv + dec + unc)) * 180} 100 100)`}>
                    <line x1="100" y1="100" x2="100" y2="29" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                    <circle cx="100" cy="100" r="5" fill="var(--text)" opacity="0.8" />
                    <circle cx="100" cy="100" r="2.5" fill="var(--bg)" />
                  </g>
                </svg>
              </div>
              <div className="fg-score">{adv > dec ? 'Bullish' : adv < dec ? 'Bearish' : 'Neutral'}</div>
              <div className="fg-lbl">{adv > dec ? 'Greed' : adv < dec ? 'Fear' : 'Neutral'}</div>
              <div className="fg-grid">
                <div className="fg-item">
                  <div className="fg-item-label">Advancing</div>
                  <div className="fg-item-val" style={{ color: 'var(--pos)' }}>{adv}</div>
                </div>
                <div className="fg-item">
                  <div className="fg-item-label">Declining</div>
                  <div className="fg-item-val" style={{ color: 'var(--neg)' }}>{dec}</div>
                </div>
                <div className="fg-item">
                  <div className="fg-item-label">Unchanged</div>
                  <div className="fg-item-val" style={{ color: 'var(--muted)' }}>{unc}</div>
                </div>
                <div className="fg-item">
                  <div className="fg-item-label">A/D Ratio</div>
                  <div className="fg-item-val">{dec > 0 ? (adv / dec).toFixed(2) : '∞'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* NGX Indices */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">NGX Indices</div>
              <span className="panel-tag">{dateLabel}</span>
            </div>
            {INDICES.map(idx => (
              <div key={idx.n} className="index-row">
                <div style={{ flex: 1 }}>
                  <div className="idx-name">{idx.n}</div>
                  <div className="idx-sub">{idx.sub}</div>
                </div>
                <span className="idx-val">{idx.v}</span>
                <span className={`idx-chg ${idx.up ? 'up' : 'dn'}`}>{idx.d}</span>
                <span className="idx-ytd up">{idx.ytd}</span>
              </div>
            ))}
          </div>

          {/* Fixed Income */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">T-Bills</div>
              <span className="panel-tag">CBN Auction Rates</span>
            </div>
            <table className="fi-table">
              <thead>
                <tr>
                  <th>Tenor</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Chg (bps)</th>
                  <th style={{ textAlign: 'right' }}>Auction</th>
                </tr>
              </thead>
              <tbody>
                {FIXED_INCOME.tbills.map(t => {
                  const chg = Math.round((t.rate - t.prev) * 100);
                  return (
                    <tr key={t.tenor}>
                      <td><strong style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{t.tenor}</strong></td>
                      <td style={{ textAlign: 'right' }}><span className="fi-rate">{t.rate.toFixed(2)}%</span></td>
                      <td style={{ textAlign: 'right' }}><span className={`fi-chg ${chg > 0 ? 'up' : chg < 0 ? 'dn' : 'flat'}`}>{chg > 0 ? '+' : ''}{chg}</span></td>
                      <td style={{ textAlign: 'right' }}><span className="fi-tenor">{t.date}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Latest News */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Latest News</div>
            </div>
            {FULL_NEWS.slice(0, 5).map((n, i) => (
              <div key={i} className="news-item">
                <span className={`news-tag ${n.tagClass}`}>{n.tagLabel}</span>
                <div className="news-headline" style={{ marginTop: 4 }}>{n.headline}</div>
                <div className="news-meta" style={{ marginTop: 4 }}>
                  <span>{n.source}</span>
                  <span>·</span>
                  <span>{n.time}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Equities Table */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div className="panel-title">NGX Equities — All Listed Stocks</div>
          <span className="panel-tag">{stocks.length} listed</span>
        </div>
        <StockTable />
      </div>

      {/* Recent Filings */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-header">
          <div className="panel-title">Recent Corporate Filings</div>
          <span className="panel-tag">Latest disclosures</span>
        </div>
        {FULL_FILINGS.slice(0, 6).map((f, i) => (
          <div key={i} className="filing-item">
            <span className={`filing-type ${f.typeClass}`}>{f.type}</span>
            <div className="filing-info">
              <div className="filing-company">{f.co}</div>
              <div className="filing-desc">{f.desc}</div>
            </div>
            <span className="filing-date">{f.date}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
