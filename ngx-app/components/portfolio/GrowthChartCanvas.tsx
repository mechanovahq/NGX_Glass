'use client';

import { useEffect, useRef, useState } from 'react';
import type { EnrichedHolding } from '@/types/portfolio';
import { drawPFGrowthChart, type PFTimeframe, type PFChartMeta } from '@/lib/canvas/pfGrowthChart';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  enriched: EnrichedHolding[];
  totalCost: number;
  totalValue: number;
}

const TIMEFRAMES: PFTimeframe[] = ['1W', '1M', '3M', 'YTD', 'ALL'];

export default function GrowthChartCanvas({ enriched, totalCost, totalValue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tf, setTf] = useState<PFTimeframe>('1W');
  const [meta, setMeta] = useState<PFChartMeta | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const result = drawPFGrowthChart({
      canvas,
      enriched,
      totalCost,
      totalValue,
      tf,
      isDark: theme !== 'light',
    });
    setMeta(result);
  }, [enriched, totalCost, totalValue, tf, theme]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="tf-group">
          {TIMEFRAMES.map(t => (
            <button
              key={t}
              className={`tf pf-tf-btn${tf === t ? ' active' : ''}`}
              onClick={() => setTf(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {meta && (
          <div id="pfGrowthMeta" style={{ fontSize: 11, color: 'var(--muted)' }}>
            <span style={{ marginRight: 16 }}>
              Start <strong style={{ color: 'var(--text)' }}>₦{meta.start}</strong>
            </span>
            <span style={{ marginRight: 16 }}>
              Now <strong style={{ color: 'var(--text)' }}>₦{meta.now}</strong>
            </span>
            <span style={{ color: meta.up ? 'var(--accent-light)' : 'var(--red)', fontWeight: 700 }}>
              {meta.change}
            </span>
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%' }}
      />
    </div>
  );
}
