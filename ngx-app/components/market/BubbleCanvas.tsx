'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { BubbleState } from '@/types/stock';
import { initBubbles } from '@/lib/canvas/bubblePhysics';
import { tickPhysics } from '@/lib/canvas/bubblePhysics';
import { renderBubbles } from '@/lib/canvas/bubbleRenderer';
import { useStocks } from '@/context/StocksContext';
import { useTheme } from '@/context/ThemeContext';
import { BUBBLE_STOCKS } from '@/lib/data/bubbleStocks';

const SECTOR_FILTERS = ['banking', 'industrial', 'telecoms', 'oil', 'consumer'] as const;
type Filter = 'all' | typeof SECTOR_FILTERS[number];

const SECTOR_MAP: Record<string, string> = {
  banking: 'Banking', industrial: 'Industrial', telecoms: 'Telecoms',
  oil: 'Oil & Gas', consumer: 'Consumer',
};

export default function BubbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<BubbleState[]>([]);
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [tooltip, setTooltip] = useState<{ sym: string; price: number; day: number; cap: number; vol: string; sec: string; x: number; y: number } | null>(null);
  const { stocks } = useStocks();
  const { theme } = useTheme();

  const getFilteredData = useCallback((f: Filter) => {
    const data = BUBBLE_STOCKS.map(b => {
      const live = stocks.find(s => s.sym === b.sym);
      return live ? { ...b, price: live.price, day: live.day } : b;
    });
    if (f === 'all') return data;
    const sec = SECTOR_MAP[f];
    return data.filter(d => d.sec === sec);
  }, [stocks]);

  const startAnimation = useCallback((f: Filter) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.parentElement?.offsetWidth || 800;
    canvas.width = w;
    canvas.style.width = w + 'px';
    const h = canvas.height;

    const data = getFilteredData(f);
    bubblesRef.current = initBubbles(
      data.map(d => ({ ...d, capV: d.cap })),
      w, h
    );

    cancelAnimationFrame(animRef.current);

    function frame() {
      const isDark = theme !== 'light';
      tickPhysics(bubblesRef.current, w, h);
      renderBubbles(ctx!, bubblesRef.current, w, h, {
        isDark,
        hoveredSym: hoveredRef.current,
      });
      animRef.current = requestAnimationFrame(frame);
    }
    frame();
  }, [getFilteredData, theme]);

  useEffect(() => {
    startAnimation(filter);
    const ro = new ResizeObserver(() => startAnimation(filter));
    if (canvasRef.current?.parentElement) ro.observe(canvasRef.current.parentElement);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [filter, startAnimation]);

  // Update bubble prices from live stocks without re-initialising
  useEffect(() => {
    bubblesRef.current = bubblesRef.current.map(b => {
      const live = stocks.find(s => s.sym === b.sym);
      return live ? { ...b, price: live.price, day: live.day } : b;
    });
  }, [stocks]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const found = bubblesRef.current.find(b => {
      const dx = mx - b.x, dy = my - b.y;
      return dx * dx + dy * dy <= b.radius * b.radius;
    }) ?? null;
    hoveredRef.current = found?.sym ?? null;
    if (found) {
      canvas.style.cursor = 'pointer';
      setTooltip({ sym: found.sym, price: found.price, day: found.day, cap: found.capV, vol: found.vol, sec: found.sec, x: e.clientX, y: e.clientY });
    } else {
      canvas.style.cursor = 'crosshair';
      setTooltip(null);
    }
  }

  return (
    <div className="bubble-canvas-wrap">
      <div className="bfbar">
        <button className={`bfbtn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
        {SECTOR_FILTERS.map(f => (
          <button key={f} className={`bfbtn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {SECTOR_MAP[f]}
          </button>
        ))}
      </div>
      <canvas
        ref={canvasRef}
        height={360}
        style={{ display: 'block', width: '100%', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { hoveredRef.current = null; setTooltip(null); }}
      />
      {tooltip && (
        <div
          className="btip show"
          style={{ position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 10, zIndex: 500, pointerEvents: 'none' }}
        >
          <div id="btip-sym" style={{ color: tooltip.day >= 0 ? '#22c55e' : '#ef4444', fontWeight: 800 }}>{tooltip.sym}</div>
          <div>₦{tooltip.price.toLocaleString()}</div>
          <div style={{ color: tooltip.day >= 0 ? '#22c55e' : '#ef4444' }}>{tooltip.day >= 0 ? '+' : ''}{tooltip.day.toFixed(2)}%</div>
          <div style={{ color: '#94a3b8', fontSize: 10 }}>Cap ₦{tooltip.cap}B · Vol {tooltip.vol}</div>
          <div style={{ color: '#94a3b8', fontSize: 10 }}>{tooltip.sec}</div>
        </div>
      )}
    </div>
  );
}
