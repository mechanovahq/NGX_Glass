'use client';

import { useState } from 'react';
import type { Holding } from '@/types/portfolio';
import { STOCKS } from '@/lib/data/stocks';

interface Props {
  onAdd: (h: Holding) => void;
  onClose: () => void;
}

export default function AddHoldingModal({ onAdd, onClose }: Props) {
  const [sym, setSym] = useState('');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  const matchedStock = STOCKS.find(s => s.sym === sym.toUpperCase().trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const s = sym.toUpperCase().trim();
    if (!STOCKS.find(x => x.sym === s)) {
      setError(`Symbol "${s}" not found in NGX equities`);
      return;
    }
    const sh = parseFloat(shares);
    const ac = parseFloat(avgCost);
    if (!sh || sh <= 0) { setError('Shares must be a positive number'); return; }
    if (!ac || ac <= 0) { setError('Avg cost must be a positive number'); return; }
    onAdd({ sym: s, shares: sh, avgCost: ac, buyDate });
  }

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="login-header">
          <div style={{ fontWeight: 800, fontSize: 14 }}>Add Holding</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">NGX Symbol</label>
            <input
              className="form-input"
              value={sym}
              onChange={e => setSym(e.target.value.toUpperCase())}
              placeholder="e.g. GTCO"
              required
              list="stock-syms"
            />
            <datalist id="stock-syms">
              {STOCKS.map(s => <option key={s.sym} value={s.sym}>{s.co}</option>)}
            </datalist>
            {matchedStock && (
              <div style={{ fontSize: 11, color: 'var(--accent-light)', marginTop: 3 }}>
                ✓ {matchedStock.co} — ₦{matchedStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} live
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Number of Shares</label>
            <input
              type="number"
              className="form-input"
              value={shares}
              onChange={e => setShares(e.target.value)}
              placeholder="e.g. 1000"
              min="1"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Average Cost per Share (₦)</label>
            <input
              type="number"
              className="form-input"
              value={avgCost}
              onChange={e => setAvgCost(e.target.value)}
              placeholder={matchedStock ? `Current: ₦${matchedStock.price.toFixed(2)}` : 'e.g. 50.00'}
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              className="form-input"
              value={buyDate}
              onChange={e => setBuyDate(e.target.value)}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          {shares && avgCost && (
            <div style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 8, marginBottom: 4 }}>
              Cost basis: ₦{(parseFloat(shares) * parseFloat(avgCost)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              {matchedStock && (
                <> · Current value: ₦{(parseFloat(shares) * matchedStock.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}</>
              )}
            </div>
          )}
          <button type="submit" className="btn-login">Add to Portfolio</button>
        </form>
      </div>
    </div>
  );
}
