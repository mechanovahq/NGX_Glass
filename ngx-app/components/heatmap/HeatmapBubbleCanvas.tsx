'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { BubbleState } from '@/types/stock';
import type { Stock } from '@/types/stock';
import { initHeatmapBubbles, tickPhysics } from '@/lib/canvas/bubblePhysics';
import { renderBubbles } from '@/lib/canvas/bubbleRenderer';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  stocks: Stock[];
}

export default function HeatmapBubbleCanvas({ stocks }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<BubbleState[]>([]);
  const animRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const [tooltip, setTooltip] = useState<{ sym: string; price: number; day: number; capV: number; vol: string; sec: string; x: number; y: number } | null>(null);
  const { theme } = useTheme();

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.parentElement?.offsetWidth || 800;
    canvas.width = w;
    canvas.style.width = w + 'px';
    const h = canvas.height;

    bubblesRef.current = initHeatmapBubbles(
      stocks.map(s => ({ ...s, capV: s.capV || 1 })),
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
  }, [stocks, theme]);

  useEffect(() => {
    startAnimation();
    const ro = new ResizeObserver(startAnimation);
    if (canvasRef.current?.parentElement) ro.observe(canvasRef.current.parentElement);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [startAnimation]);

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
      setTooltip({ sym: found.sym, price: found.price, day: found.day, capV: found.capV, vol: found.vol, sec: found.sec, x: e.clientX, y: e.clientY });
    } else {
      canvas.style.cursor = 'crosshair';
      setTooltip(null);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        height={480}
        style={{ display: 'block', width: '100%', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { hoveredRef.current = null; setTooltip(null); }}
      />
      {tooltip && (
        <div
          className="btip show"
          style={{ position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 10, zIndex: 500, pointerEvents: 'none' }}
        >
          <div style={{ color: tooltip.day >= 0 ? '#22c55e' : '#ef4444', fontWeight: 800 }}>{tooltip.sym}</div>
          <div>₦{tooltip.price.toLocaleString()}</div>
          <div style={{ color: tooltip.day >= 0 ? '#22c55e' : '#ef4444' }}>{tooltip.day >= 0 ? '+' : ''}{tooltip.day.toFixed(2)}%</div>
          <div style={{ color: '#94a3b8', fontSize: 10 }}>
            Cap {tooltip.capV >= 1000 ? '₦' + (tooltip.capV / 1000).toFixed(1) + 'T' : '₦' + tooltip.capV + 'B'} · Vol {tooltip.vol}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 10 }}>{tooltip.sec}</div>
        </div>
      )}
    </div>
  );
}
