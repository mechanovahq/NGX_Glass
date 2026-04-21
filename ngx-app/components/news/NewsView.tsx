'use client';

import { useState, useMemo } from 'react';
import { FULL_NEWS } from '@/lib/data/news';
import { useStocks } from '@/context/StocksContext';

const TAGS = [
  { label: 'All', value: 'all' },
  { label: 'Market', value: 'market' },
  { label: 'Banking', value: 'banking' },
  { label: 'Energy', value: 'energy' },
  { label: 'Macro', value: 'macro' },
  { label: 'Telecoms', value: 'telecom' },
  { label: 'Corporate', value: 'corporate' },
];

export default function NewsView() {
  const { marketStats } = useStocks();
  const [tag, setTag] = useState('all');

  const filtered = useMemo(() =>
    tag === 'all' ? FULL_NEWS : FULL_NEWS.filter(n => n.tag === tag),
    [tag]
  );

  const [featured, ...rest] = filtered;

  const trending = useMemo(() => {
    const counts: Record<string, number> = {};
    FULL_NEWS.forEach(n => { counts[n.tag] = (counts[n.tag] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, []);

  return (
    <div id="news-view">
      <div className="page-header">
        <div>
          <div className="page-title">NGX Market News</div>
          <div className="page-meta">Nigerian capital market news &amp; analysis</div>
        </div>
      </div>

      {/* Tag filter */}
      <div className="news-tag-filter" style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {TAGS.map(t => (
          <button
            key={t.value}
            className={`ntf-btn${tag === t.value ? ' active' : ''}`}
            onClick={() => setTag(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="two-col">
        {/* Main news grid */}
        <div style={{ flex: 2 }}>
          {featured && (
            <div className="panel news-main-card" style={{ marginBottom: 12, cursor: featured.url ? 'pointer' : 'default' }}
              onClick={() => featured.url && window.open(featured.url, '_blank')}>
              <span className={`news-tag ${featured.tagClass}`}>{featured.tagLabel}</span>
              <div className="news-headline-lg" style={{ margin: '10px 0 8px' }}>
                {featured.headline}
              </div>
              <div className="news-meta-row">{featured.source} <span>·</span> {featured.time}</div>
            </div>
          )}
          <div className="news-grid">
            {rest.map((n, i) => (
              <div
                key={i}
                className="panel"
                style={{ cursor: n.url ? 'pointer' : 'default', padding: '14px 16px' }}
                onClick={() => n.url && window.open(n.url, '_blank')}
              >
                <span className={`news-tag ${n.tagClass}`}>{n.tagLabel}</span>
                <div className="news-headline" style={{ marginTop: 5 }}>{n.headline}</div>
                <div className="news-meta" style={{ marginTop: 5 }}>{n.source} <span>·</span> {n.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Trending Topics</div></div>
            {trending.map(([t, count]) => (
              <div key={t} style={{ padding: '9px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'capitalize', letterSpacing: '0.04em' }}>{t}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, background: 'var(--surface-2)', border: '0.5px solid var(--border)', padding: '2px 7px', borderRadius: 2, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{count}</span>
              </div>
            ))}
          </div>
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Market Summary</div></div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--muted-2)' }}>
              {(() => {
                const asi = marketStats.asi ?? 110841;
                const pct = marketStats.asiChangePct ?? 0.47;
                const chg = marketStats.asiChange ?? 521;
                const up = pct >= 0;
                const date = marketStats.updated
                  ? new Date(marketStats.updated).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' })
                  : 'April 17, 2026';
                const turn = marketStats.turnover ?? '₦38.92B';
                return `The NGX All-Share Index closed at ${asi.toLocaleString()} on ${date} — ${up ? 'up' : 'down'} ${Math.abs(pct).toFixed(2)}% (${up ? '+' : ''}${Math.abs(chg).toLocaleString()} points). Telecoms and banking stocks led the session while oil & gas saw mild profit-taking. Total turnover was ${turn.startsWith('₦') ? turn : '₦' + turn}.`;
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
