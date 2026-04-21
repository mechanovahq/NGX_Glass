import type { EnrichedHolding } from '@/types/portfolio';
import { SECTOR_COLORS } from '@/lib/constants';

export interface AllocationSlice {
  sector: string;
  value: number;
  pct: string;
  color: string;
}

export function drawAllocationChart(
  canvas: HTMLCanvasElement,
  enriched: EnrichedHolding[],
  totalValue: number,
  isDark: boolean
): AllocationSlice[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!enriched.length) {
    ctx.fillStyle = isDark ? '#1f2228' : '#f0ede8';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, W / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b8a82';
    ctx.font = '11px Inter,system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No holdings', W / 2, H / 2);
    return [];
  }

  const sectorMap: Record<string, number> = {};
  enriched.forEach(p => {
    sectorMap[p.sector] = (sectorMap[p.sector] || 0) + p.mktValue;
  });
  const sectors = Object.entries(sectorMap).sort((a, b) => b[1] - a[1]);
  const cx = W / 2, cy = H / 2, outerR = W / 2 - 4, innerR = (W / 2) * 0.52;

  let angle = -Math.PI / 2;
  sectors.forEach(([sec, val]) => {
    const slice = (val / totalValue) * Math.PI * 2;
    const col = SECTOR_COLORS[sec] || '#64748b';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = isDark ? '#14161a' : '#f5f4f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    angle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#14161a' : '#f5f4f0';
  ctx.fill();

  // Center label
  ctx.fillStyle = isDark ? '#e8e6df' : '#1a1916';
  ctx.font = `600 12px JetBrains Mono,monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${enriched.length}${enriched.length === 1 ? ' stock' : ' stocks'}`, cx, cy - 7);
  ctx.fillStyle = '#8b8a82';
  ctx.font = '10px JetBrains Mono,monospace';
  ctx.fillText(`${sectors.length} sector${sectors.length !== 1 ? 's' : ''}`, cx, cy + 9);

  return sectors.map(([sector, value]) => ({
    sector,
    value,
    pct: (value / totalValue * 100).toFixed(1),
    color: SECTOR_COLORS[sector] || '#64748b',
  }));
}
