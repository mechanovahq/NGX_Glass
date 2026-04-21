'use client';

import { useState, useMemo } from 'react';
import { useStocks } from '@/context/StocksContext';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { EnrichedHolding } from '@/types/portfolio';
import StockLogo from '@/components/shared/StockLogo';
import PricePill from '@/components/shared/PricePill';
import GrowthChartCanvas from './GrowthChartCanvas';
import AllocationChartCanvas from './AllocationChartCanvas';
import AddHoldingModal from './AddHoldingModal';

export default function PortfolioView() {
  const { stocks } = useStocks();
  const { holdings, transactions, addHolding, removeHolding } = usePortfolio();
  const [addOpen, setAddOpen] = useState(false);

  const enriched: EnrichedHolding[] = useMemo(() =>
    holdings.map(h => {
      const s = stocks.find(x => x.sym === h.sym);
      const currentPrice = s ? s.price : h.avgCost;
      const mktValue = currentPrice * h.shares;
      const costBasis = h.avgCost * h.shares;
      return {
        ...h,
        currentPrice,
        mktValue,
        costBasis,
        plN: mktValue - costBasis,
        plPct: ((currentPrice - h.avgCost) / h.avgCost) * 100,
        dayChange: s ? s.day : 0,
        sector: s ? s.sec : 'Unknown',
        co: s ? s.co : h.sym,
        divYield: s ? s.div : 0,
        pe: s ? s.pe : 0,
      };
    }),
    [holdings, stocks]
  );

  const totalValue  = enriched.reduce((a, p) => a + p.mktValue, 0);
  const totalCost   = enriched.reduce((a, p) => a + p.costBasis, 0);
  const totalPL     = totalValue - totalCost;
  const totalPLPct  = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
  const todayChange = enriched.reduce((a, p) => a + (p.mktValue * p.dayChange / 100), 0);

  const isEmpty = enriched.length === 0;

  return (
    <div id="portfolio-view">
      <div className="page-header">
        <div>
          <div className="page-title">Portfolio Tracker</div>
          <div className="page-meta">
            {isEmpty ? 'No holdings yet — add your first NGX stock to get started' :
              `${holdings.length} holding${holdings.length !== 1 ? 's' : ''} · ₦${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} total value · P&L: ${totalPLPct >= 0 ? '+' : ''}${totalPLPct.toFixed(2)}%`}
          </div>
        </div>
        <button className="btn-primary" onClick={() => setAddOpen(true)}>+ Add Holding</button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, border: '0.5px solid var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 20 }}>
        {[
          { l: 'Portfolio Value',  v: '₦' + totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: `${enriched.length} holding${enriched.length !== 1 ? 's' : ''}`, col: 'var(--text)' },
          { l: 'Total Cost Basis', v: '₦' + totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }),  sub: 'Amount invested',  col: 'var(--text)' },
          { l: 'Total P&L',        v: (totalPL >= 0 ? '+' : '') + '₦' + Math.abs(totalPL).toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: (totalPLPct >= 0 ? '+' : '') + totalPLPct.toFixed(2) + '% overall', col: totalPL >= 0 ? 'var(--pos)' : 'var(--neg)' },
          { l: "Today's Change",   v: (todayChange >= 0 ? '+' : '') + '₦' + Math.abs(todayChange).toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: 'Unrealised daily P&L', col: todayChange >= 0 ? 'var(--pos)' : 'var(--neg)' },
        ].map((s, i) => (
          <div key={i} className="pf-stat-card stat-card" style={{ borderRight: i < 3 ? '0.5px solid var(--border)' : 'none' }}>
            <div className="stat-label">{s.l}</div>
            <div className="stat-value" style={{ color: s.col }}>{s.v}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Growth Chart */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <div className="panel-title">Portfolio Growth</div>
        </div>
        <GrowthChartCanvas enriched={enriched} totalCost={totalCost} totalValue={totalValue} />
      </div>

      {/* Holdings Table */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <div className="panel-title">Holdings</div>
          <span className="panel-tag">{enriched.length} position{enriched.length !== 1 ? 's' : ''}</span>
        </div>
        {isEmpty ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5, color: 'var(--text)' }}>No holdings yet</div>
            <div style={{ fontSize: 11.5 }}>Click <strong style={{ color: 'var(--pos)' }}>+ Add Holding</strong> to start tracking</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Symbol</th><th>Shares</th><th className="r">Avg Cost</th>
                  <th className="r">Live Price</th><th className="r">Mkt Value</th>
                  <th className="r">Cost Basis</th><th className="r">P&L (₦)</th>
                  <th className="r">P&L %</th><th className="r">Day %</th>
                  <th className="r">Weight</th><th></th>
                </tr>
              </thead>
              <tbody>
                {enriched.map(p => (
                  <tr key={p.sym}>
                    <td className="sym-cell">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StockLogo sym={p.sym} sec={p.sector} size={26} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{p.sym}</div>
                          <div style={{ fontSize: 9.5, color: 'var(--muted)' }}>{p.co}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{p.shares.toLocaleString()}</td>
                    <td className="r" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>₦{p.avgCost.toFixed(2)}</td>
                    <td className="r" style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700 }}>₦{p.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="r" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>₦{p.mktValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="r" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>₦{p.costBasis.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="r" style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: p.plN >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                      {p.plN >= 0 ? '+' : ''}₦{Math.abs(p.plN).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="r"><PricePill value={p.plPct} /></td>
                    <td className="r"><PricePill value={p.dayChange} /></td>
                    <td className="r" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                      {totalValue > 0 ? (p.mktValue / totalValue * 100).toFixed(1) + '%' : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => removeHolding(p.sym)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom panels */}
      {!isEmpty && (
        <div className="two-col">
          {/* Allocation Chart */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Sector Allocation</div></div>
            <AllocationChartCanvas enriched={enriched} totalValue={totalValue} />
          </div>

          {/* Top Performers */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Performers</div></div>
            {[...enriched].sort((a, b) => b.plPct - a.plPct).map(p => (
              <div key={p.sym} className="perf-row">
                <StockLogo sym={p.sym} sec={p.sector} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{p.sym}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)' }}>{p.co}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={p.plPct >= 0 ? 'up' : 'dn'} style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700 }}>
                    {p.plPct >= 0 ? '+' : ''}{p.plPct.toFixed(2)}%
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
                    {p.plN >= 0 ? '+' : ''}₦{p.plN.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Risk Metrics */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Risk Metrics</div></div>
            {(() => {
              const sorted = [...enriched].sort((a, b) => b.mktValue - a.mktValue);
              const top = sorted[0];
              const concentration = totalValue > 0 ? (top.mktValue / totalValue * 100).toFixed(1) : 0;
              const sectors = new Set(enriched.map(p => p.sector)).size;
              const winners = enriched.filter(p => p.plPct > 0).length;
              const avgPE = (enriched.filter(p => p.pe > 0).reduce((s, p) => s + p.pe, 0) / (enriched.filter(p => p.pe > 0).length || 1)).toFixed(1);
              const totalReturn = totalCost > 0 ? (totalPL / totalCost * 100).toFixed(2) : '0.00';
              return [
                { l: 'Positions',        v: enriched.length.toString() },
                { l: 'Sectors',          v: sectors.toString() },
                { l: 'Largest Holding',  v: `${top.sym} (${concentration}%)` },
                { l: 'Win Rate',         v: `${winners}/${enriched.length} (${Math.round(winners / enriched.length * 100)}%)` },
                { l: 'Avg Portfolio P/E',v: `${avgPE}x` },
                { l: 'Total Return',     v: (+totalReturn >= 0 ? '+' : '') + totalReturn + '%', col: +totalReturn >= 0 ? 'var(--pos)' : 'var(--neg)' },
              ].map(m => (
                <div key={m.l} className="risk-metric-row">
                  <span className="risk-label">{m.l}</span>
                  <span className="risk-val" style={{ color: m.col }}>{m.v}</span>
                </div>
              ));
            })()}
          </div>

          {/* Recent Activity */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Recent Activity</div></div>
            {transactions.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: 16 }}>No activity yet</div>
            ) : transactions.slice(0, 8).map((t, i) => (
              <div key={i} className="activity-item">
                <span className={`act-type ${t.type === 'BUY' ? 'act-buy' : 'act-sell'}`}>{t.type}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 11.5 }}>{t.sym}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{t.shares.toLocaleString()} shares @ ₦{t.price.toFixed(2)}</div>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{t.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {addOpen && (
        <AddHoldingModal
          onAdd={h => { addHolding(h); setAddOpen(false); }}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}
