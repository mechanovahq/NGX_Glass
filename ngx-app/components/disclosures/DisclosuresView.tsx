'use client';

import { useState, useMemo } from 'react';
import { FULL_FILINGS } from '@/lib/data/filings';
import { earningsCalendar } from '@/lib/data/earningsCalendar';

const CO_NAMES: Record<string, string> = {
  DANGCEM:     'Dangote Cement Plc',
  NGXREG:      'NGX Regulation Co.',
  TRANSCORP:   'Transcorp Plc',
  NGXGROUP:    'Nigerian Exchange Group',
  ZENITHBANK:  'Zenith Bank Plc',
  FCMB:        'FCMB Group Plc',
  NESTLE:      'Nestle Nigeria Plc',
  UBA:         'United Bank for Africa',
  MTNN:        'MTN Nigeria Comms',
  GTCO:        'Guaranty Trust Hldg Co',
  FIRSTHOLDCO: 'First HoldCo Plc',
  SEPLAT:      'Seplat Energy Plc',
  ACCESSCORP:  'Access Holdings Plc',
  FIDELITYBK:  'Fidelity Bank Plc',
  GUINNESS:    'Guinness Nigeria Plc',
  STANBIC:     'Stanbic IBTC Holdings',
  OANDO:       'Oando Plc',
  WEMABANK:    'Wema Bank Plc',
};

const CATEGORIES = [
  { label: 'All Filings',       value: 'all',        icon: '◈' },
  { label: 'Financial Results', value: 'RESULTS',    icon: '◰' },
  { label: 'Dividends',         value: 'DIVIDEND',   icon: '⬡' },
  { label: 'Board Meetings',    value: 'BOARD MTG',  icon: '◫' },
  { label: 'AGM / EGM',         value: 'AGM',        icon: '◎' },
  { label: 'Disclosures',       value: 'DISCLOSURE', icon: '◇' },
  { label: 'Rights Issues',     value: 'RIGHTS',     icon: '◌' },
];

const TIME_RANGES = [
  { label: '7D',  days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'All', days: Infinity },
];

const TYPE_BADGE: Record<string, { bg: string; color: string }> = {
  RESULTS:     { bg: 'rgba(74,157,124,0.10)',  color: 'var(--pos)' },
  DIVIDEND:    { bg: 'rgba(201,169,97,0.10)', color: 'var(--accent)' },
  'BOARD MTG': { bg: 'rgba(90,143,212,0.10)', color: 'var(--blue)' },
  AGM:         { bg: 'rgba(197,86,62,0.10)',  color: 'var(--neg)' },
  DISCLOSURE:  { bg: 'rgba(176,160,220,0.10)', color: '#b8a8e0' },
  RIGHTS:      { bg: 'rgba(176,160,220,0.10)', color: '#b8a8e0' },
};

const DIVIDENDS = [
  { sym: 'GTCO',        co: 'Guaranty Trust Hldg',       yield: '₦5.00/share',  date: 'Mar 2026' },
  { sym: 'UBA',         co: 'United Bank for Africa',    yield: '₦2.00/share',  date: 'Mar 2026' },
  { sym: 'FIRSTHOLDCO', co: 'First HoldCo Plc',          yield: '₦0.50/share',  date: 'Mar 2026' },
  { sym: 'ZENITHBANK',  co: 'Zenith Bank Plc',           yield: '₦3.50/share',  date: 'Apr 2026' },
  { sym: 'DANGCEM',     co: 'Dangote Cement',            yield: '₦45.00/share', date: 'Apr 2026' },
  { sym: 'ACCESS',      co: 'Access Holdings',           yield: '₦1.70/share',  date: 'May 2026' },
  { sym: 'MTNN',        co: 'MTN Nigeria',               yield: '₦20.00/share', date: 'Jun 2026' },
  { sym: 'CAP',         co: 'Chemical & Allied Products', yield: '₦8.50/share', date: 'May 2026' },
];

function parseDateMs(dateStr: string): number {
  return new Date(dateStr).getTime();
}

function relativeTime(dateStr: string): string {
  const now = new Date('2026-04-21').getTime();
  const days = Math.floor((now - parseDateMs(dateStr)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7)  return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

export default function DisclosuresView() {
  const [category, setCategory] = useState('all');
  const [timeDays, setTimeDays] = useState(Infinity);
  const [search, setSearch] = useState('');

  const counts = useMemo(() => ({
    all:     FULL_FILINGS.length,
    results: FULL_FILINGS.filter(f => f.type === 'RESULTS').length,
    div:     FULL_FILINGS.filter(f => f.type === 'DIVIDEND').length,
    board:   FULL_FILINGS.filter(f => f.type === 'BOARD MTG' || f.type === 'AGM').length,
  }), []);

  const filings = useMemo(() => {
    const now = new Date('2026-04-21').getTime();
    let data = FULL_FILINGS;
    if (category !== 'all') data = data.filter(f => f.type === category);
    if (timeDays !== Infinity) {
      data = data.filter(f => now - parseDateMs(f.date) <= timeDays * 86_400_000);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(f =>
        f.co.toLowerCase().includes(q) ||
        (CO_NAMES[f.co] || '').toLowerCase().includes(q) ||
        f.desc.toLowerCase().includes(q)
      );
    }
    return data;
  }, [category, timeDays, search]);

  const STAT_CARDS = [
    { label: 'All Filings',       num: counts.all,     filter: 'all',       sub: 'total filings' },
    { label: 'Financial Results', num: counts.results,  filter: 'RESULTS',   sub: 'earnings releases' },
    { label: 'Dividends',         num: counts.div,      filter: 'DIVIDEND',  sub: 'declared payouts' },
    { label: 'Board / AGM',       num: counts.board,    filter: 'BOARD MTG', sub: 'corporate events' },
  ];

  const hasFilters = search || category !== 'all' || timeDays !== Infinity;

  return (
    <div id="disclosures-view">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="disc-pulse" />
            Live Filing Feed
          </div>
          <div className="page-meta">NGX-listed company announcements, filings &amp; corporate events</div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="disc-stats-grid">
        {STAT_CARDS.map(s => (
          <div
            key={s.filter}
            className={`disc-stat-card${category === s.filter ? ' active' : ''}`}
            onClick={() => setCategory(s.filter)}
          >
            <div className="disc-stat-label">{s.label}</div>
            <div className="disc-stat-num">{s.num}</div>
            <div className="disc-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Main feed */}
        <div style={{ flex: 2 }}>
          <div className="panel">
            {/* Search */}
            <div style={{ padding: '12px 16px 0' }}>
              <input
                className="disc-search-bar"
                placeholder="🔍  Search by company, ticker or keyword…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {/* Category filter */}
              <div className="disc-filter-row">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    className={`disc-filter-btn${category === c.value ? ' active' : ''}`}
                    onClick={() => setCategory(c.value)}
                  >
                    <span style={{ marginRight: 4, opacity: 0.7 }}>{c.icon}</span>{c.label}
                  </button>
                ))}
              </div>
              {/* Time range */}
              <div className="disc-time-row" style={{ paddingBottom: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', alignSelf: 'center', marginRight: 4 }}>Period:</span>
                {TIME_RANGES.map(t => (
                  <button
                    key={t.label}
                    className={`disc-time-btn${timeDays === t.days ? ' active' : ''}`}
                    onClick={() => setTimeDays(t.days)}
                  >
                    {t.label}
                  </button>
                ))}
                {hasFilters && (
                  <button
                    onClick={() => { setSearch(''); setCategory('all'); setTimeDays(Infinity); }}
                    style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 8px' }}
                  >
                    Clear all ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filing count bar */}
            <div style={{ padding: '6px 16px 8px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                {filings.length} filing{filings.length !== 1 ? 's' : ''} shown
              </span>
            </div>

            {/* Filings */}
            {filings.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>No filings match</div>
                <div style={{ fontSize: 11 }}>Try a different filter or clear your search</div>
              </div>
            ) : filings.map((f, i) => {
              const badge = TYPE_BADGE[f.type] || TYPE_BADGE.DISCLOSURE;
              return (
                <div key={i} className="disc-filing-row">
                  <div className="disc-filing-top">
                    <span className="disc-ticker">{f.co}</span>
                    <span className="disc-coname">{CO_NAMES[f.co] || f.co}</span>
                    <span className="disc-badge" style={{ background: badge.bg, color: badge.color }}>
                      {f.type}
                    </span>
                    <span className="disc-time">{relativeTime(f.date)}</span>
                  </div>
                  <div className="disc-desc">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Earnings Calendar */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Earnings Calendar</div>
              <span className="panel-tag">{earningsCalendar.length} upcoming</span>
            </div>
            {earningsCalendar.map((e, i) => (
              <div key={i} className="earnings-item">
                <span className="earnings-date">{e.date}</span>
                <div style={{ flex: 1 }}>
                  <div className="earnings-sym">{e.sym}</div>
                  <div className="earnings-co">{e.co}</div>
                </div>
                <span className={`earnings-type ${e.typeClass}`}>{e.type}</span>
              </div>
            ))}
          </div>

          {/* Dividend Board */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Upcoming Dividends</div>
              <span className="panel-tag">{DIVIDENDS.length} declared</span>
            </div>
            {DIVIDENDS.map(d => (
              <div key={d.sym} className="div-row">
                <div style={{ flex: 1 }}>
                  <div className="dv-sym">{d.sym}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)' }}>{d.co}</div>
                </div>
                <div className="dv-info">
                  <div className="dv-yield up">{d.yield}</div>
                  <div className="dv-date">{d.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
