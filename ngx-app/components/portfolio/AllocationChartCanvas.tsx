'use client';

import { useEffect, useRef, useState } from 'react';
import type { EnrichedHolding } from '@/types/portfolio';
import { drawAllocationChart, type AllocationSlice } from '@/lib/canvas/allocationChart';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  enriched: EnrichedHolding[];
  totalValue: number;
}

export default function AllocationChartCanvas({ enriched, totalValue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slices, setSlices] = useState<AllocationSlice[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const result = drawAllocationChart(canvas, enriched, totalValue, theme !== 'light');
    setSlices(result);
  }, [enriched, totalValue, theme]);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <canvas ref={canvasRef} width={160} height={160} style={{ flexShrink: 0 }} />
      <div id="allocation-legend" style={{ flex: 1 }}>
        {slices.map(s => (
          <div key={s.sector} className="alloc-legend-item">
            <div className="alloc-dot" style={{ background: s.color }} />
            <span className="alloc-name">{s.sector}</span>
            <span className="alloc-val">₦{s.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="alloc-pct">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
