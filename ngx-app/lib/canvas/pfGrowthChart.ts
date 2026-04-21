import type { EnrichedHolding } from '@/types/portfolio';
import { pfAbbr } from '@/lib/utils/format';

export type PFTimeframe = '1W' | '1M' | '3M' | 'YTD' | 'ALL';

interface DataPoint {
  v: number;
  label: string;
}

export function generatePFHistory(
  enriched: EnrichedHolding[],
  totalCost: number,
  totalValue: number,
  tf: PFTimeframe
): DataPoint[] {
  if (!enriched.length || !totalValue) return [];

  let days: number;
  if (tf === '1W') {
    days = 7;
  } else if (tf === '1M') {
    days = 30;
  } else if (tf === '3M') {
    days = 90;
  } else if (tf === 'YTD') {
    const now = new Date();
    days = Math.max(1, Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000));
  } else {
    // ALL — use earliest buy date
    const earliest = enriched.reduce<Date>((min, p) => {
      if (!p.buyDate) return min;
      const d = new Date(p.buyDate);
      return d < min ? d : min;
    }, new Date());
    days = Math.max(7, Math.floor((new Date().getTime() - earliest.getTime()) / 86400000));
  }

  const data: DataPoint[] = [];
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startVal = Math.min(totalCost * 0.91, totalValue * 0.88);
  const endVal = totalValue;
  const range = endVal - startVal;

  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const progress = i / days;
    const noise = ((i * 31 + 13) % 97 / 97 - 0.46) * Math.abs(range) * 0.04;
    const v = Math.round(startVal + range * (progress * progress * 0.4 + progress * 0.6) + noise);
    data.push({
      v: Math.max(v, 1),
      label: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    });
  }

  if (data.length) data[data.length - 1].v = Math.round(endVal);
  return data;
}

interface DrawPFChartOptions {
  canvas: HTMLCanvasElement;
  enriched: EnrichedHolding[];
  totalCost: number;
  totalValue: number;
  tf: PFTimeframe;
  isDark: boolean;
}

/** Returns the meta text (start / now / change) as an object for display */
export interface PFChartMeta {
  start: string;
  now: string;
  change: string;
  up: boolean;
}

export function drawPFGrowthChart({
  canvas,
  enriched,
  totalCost,
  totalValue,
  tf,
  isDark,
}: DrawPFChartOptions): PFChartMeta | null {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || canvas.offsetWidth || 600;
  const H = 200;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pts = generatePFHistory(enriched, totalCost, totalValue, tf);

  if (!pts.length) {
    ctx.fillStyle = '#8b8a82';
    ctx.font = '12px Inter,system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add holdings to see portfolio growth', W / 2, H / 2);
    return null;
  }

  const values = pts.map(p => p.v);
  const rawMin = Math.min(...values), rawMax = Math.max(...values);
  const pad5 = (rawMax - rawMin) * 0.08 || rawMax * 0.02;
  const minV = rawMin - pad5, maxV = rawMax + pad5;
  const range = maxV - minV || 1;
  const pad = { t: 14, r: 14, b: 26, l: 60 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const up = pts[pts.length - 1].v >= pts[0].v;
  const lineCol = up ? '#4a9d7c' : '#c5563e';

  const xOf = (i: number) => pad.l + (i / (pts.length - 1)) * cW;
  const yOf = (v: number) => pad.t + cH - ((v - minV) / range) * cH;

  // Grid + Y labels
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (i / 4) * cH;
    ctx.strokeStyle = isDark ? 'rgba(232,230,223,0.05)' : 'rgba(10,11,13,0.05)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#8b8a82';
    ctx.font = '9px JetBrains Mono,monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('₦' + pfAbbr(maxV - (i / 4) * range), pad.l - 4, y);
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
  grad.addColorStop(0, up ? 'rgba(74,157,124,0.14)' : 'rgba(197,86,62,0.14)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.beginPath();
  pts.forEach((p, i) => { i === 0 ? ctx.moveTo(xOf(i), yOf(p.v)) : ctx.lineTo(xOf(i), yOf(p.v)); });
  ctx.lineTo(xOf(pts.length - 1), pad.t + cH);
  ctx.lineTo(pad.l, pad.t + cH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  pts.forEach((p, i) => { i === 0 ? ctx.moveTo(xOf(i), yOf(p.v)) : ctx.lineTo(xOf(i), yOf(p.v)); });
  ctx.strokeStyle = lineCol; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();

  // End dot
  const lx = xOf(pts.length - 1), ly = yOf(pts[pts.length - 1].v);
  ctx.beginPath(); ctx.arc(lx, ly, 4.5, 0, Math.PI * 2); ctx.fillStyle = lineCol; ctx.fill();
  ctx.beginPath(); ctx.arc(lx, ly, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();

  // X-axis labels
  const nLabels = Math.min(pts.length, 6);
  ctx.fillStyle = '#8b8a82';
  ctx.font = '9px JetBrains Mono,monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i < nLabels; i++) {
    const idx = Math.round((i / (nLabels - 1)) * (pts.length - 1));
    ctx.fillText(pts[idx].label, xOf(idx), H - pad.b + 4);
  }

  const first = pts[0].v, last = pts[pts.length - 1].v;
  const chg = last - first, chgPct = first > 0 ? (chg / first) * 100 : 0;
  return {
    start: pfAbbr(first),
    now: pfAbbr(last),
    change: `${chg >= 0 ? '+' : ''}₦${pfAbbr(chg)} (${chgPct >= 0 ? '+' : ''}${chgPct.toFixed(2)}%)`,
    up,
  };
}
