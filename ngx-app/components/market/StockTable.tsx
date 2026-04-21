'use client';

import { useState, useMemo } from 'react';
import { useStocks } from '@/context/StocksContext';
import StockLogo from '@/components/shared/StockLogo';
import PricePill from '@/components/shared/PricePill';
import { STOCKS } from '@/lib/data/stocks';

type SortKey = 'r' | 'price' | 'day' | 'week' | 'ytd' | 'capV' | 'volV' | 'pe' | 'div';
const SECTORS = ['All Sectors', ...Array.from(new Set(STOCKS.map(s => s.sec))).sort()];

export default function StockTable() {
  const { stocks } = useStocks();
  const [sector, setSector] = useState('All Sectors');
  const [sortKey, setSortKey] = useState<SortKey>('r');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [search, setSearch] = useState('');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 1 ? -1 : 1);
    else { setSortKey(key); setSortDir(1); }
  }

  const filtered = useMemo(() => {
    let data = stocks;
    if (sector !== 'All Sectors') data = data.filter(s => s.sec === sector);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(s => s.sym.toLowerCase().includes(q) || s.co.toLowerCase().includes(q));
    }
    return [...data].sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * sortDir);
  }, [stocks, sector, search, sortKey, sortDir]);

  function Th({ k, label, right }: { k: SortKey; label: string; right?: boolean }) {
    const active = sortKey === k;
    return (
      <th
        onClick={() => toggleSort(k)}
        style={{
          textAlign: right ? 'right' : 'left',
          color: active ? 'var(--accent)' : undefined,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {label}{active ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}
      </th>
    );
  }

  return (
    <div>
      {/* Sector filter */}
      <div className="sector-filter">
        {SECTORS.map(s => (
          <button
            key={s}
            className={`sf-btn${sector === s ? ' active' : ''}`}
            onClick={() => setSector(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ padding: '10px 18px' }}>
        <input
          className="table-search"
          style={{ margin: 0, width: '100%' }}
          placeholder="Search symbol or name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <Th k="r" label="#" />
              <th>Symbol</th>
              <th>Company</th>
              <th>Sector</th>
              <Th k="price" label="Price (₦)" right />
              <Th k="day"   label="Day %"     right />
              <Th k="week"  label="Wk %"      right />
              <Th k="ytd"   label="YTD %"     right />
              <Th k="capV"  label="Mkt Cap"   right />
              <Th k="volV"  label="Volume"    right />
              <Th k="pe"    label="P/E"       right />
              <Th k="div"   label="Div %"     right />
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.sym}>
                <td style={{ color: 'var(--muted)', fontSize: 10 }}>{s.r}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StockLogo sym={s.sym} sec={s.sec} size={22} />
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 11.5 }}>{s.sym}</span>
                  </div>
                </td>
                <td style={{ fontSize: 11, color: 'var(--muted-2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.co}
                </td>
                <td>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 9,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: 'var(--muted)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 2, padding: '1px 5px',
                  }}>
                    {s.sec}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {s.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ textAlign: 'right' }}><PricePill value={s.day} /></td>
                <td style={{ textAlign: 'right' }}><PricePill value={s.week} /></td>
                <td style={{ textAlign: 'right' }}><PricePill value={s.ytd} /></td>
                <td style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted-2)' }}>{s.capN}</td>
                <td style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)' }}>{s.vol}</td>
                <td style={{ textAlign: 'right', fontSize: 11 }}>{s.pe > 0 ? s.pe.toFixed(1) + 'x' : '—'}</td>
                <td style={{ textAlign: 'right', fontSize: 11, color: s.div > 0 ? 'var(--accent)' : 'var(--muted)' }}>
                  {s.div > 0 ? s.div.toFixed(1) + '%' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '8px 18px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderTop: '0.5px solid var(--border)' }}>
        {filtered.length} of {stocks.length} equities
      </div>
    </div>
  );
}
