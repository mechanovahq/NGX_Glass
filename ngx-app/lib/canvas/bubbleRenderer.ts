import type { BubbleState } from '@/types/stock';
import { bubbleColor, glowColor } from '@/lib/constants';
import { drawBubbleLogo } from './logoCache';

interface DrawOptions {
  isDark: boolean;
  hoveredSym?: string | null;
}

/** Draw all bubbles onto a canvas context (one frame). */
export function renderBubbles(
  ctx: CanvasRenderingContext2D,
  bubbles: BubbleState[],
  width: number,
  height: number,
  { isDark, hoveredSym }: DrawOptions
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = isDark ? '#14161a' : '#f5f4f0';
  ctx.fillRect(0, 0, width, height);

  for (const b of bubbles) {
    const isHovered = hoveredSym === b.sym;
    const r = isHovered ? b.radius * 1.06 : b.radius;

    if (isHovered) {
      ctx.save();
      ctx.shadowBlur = 22;
      ctx.shadowColor = glowColor(b.day);
    }

    // Radial gradient fill
    const grad = ctx.createRadialGradient(b.x - r * 0.3, b.y - r * 0.3, r * 0.05, b.x, b.y, r);
    grad.addColorStop(0, bubbleColor(b.day, 0.9));
    grad.addColorStop(0.6, bubbleColor(b.day, 0.75));
    grad.addColorStop(1, bubbleColor(b.day, 0.55));

    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.strokeStyle = isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = isHovered ? 1.5 : 0.8;
    ctx.stroke();

    // Shine highlight
    const shine = ctx.createRadialGradient(b.x - r * 0.38, b.y - r * 0.42, 0, b.x - r * 0.2, b.y - r * 0.2, r * 0.55);
    shine.addColorStop(0, 'rgba(255,255,255,0.18)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fillStyle = shine;
    ctx.fill();

    if (isHovered) ctx.restore();

    // Labels
    if (r >= 26) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.max(9, Math.min(r * 0.28, 13));
      const label = b.sym.length > 8 ? b.sym.slice(0, 7) + '…' : b.sym;
      const pctText = (b.day >= 0 ? '+' : '') + b.day.toFixed(2) + '%';
      const hadLogo = r >= 30 && drawBubbleLogo(ctx, b.sym, b.x, b.y, r);

      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(232,230,223,0.95)';

      if (hadLogo) {
        const textY = b.y + r * (r >= 44 ? 0.44 : 0.52);
        if (r >= 44) ctx.fillText(label, b.x, textY);
        ctx.font = `500 ${Math.max(7.5, fontSize * 0.8)}px JetBrains Mono, monospace`;
        ctx.fillStyle = b.day >= 0 ? 'rgba(150,220,195,0.97)' : 'rgba(240,180,165,0.97)';
        ctx.fillText(pctText, b.x, b.y + r * (r >= 44 ? 0.66 : 0.54));
      } else if (r >= 38) {
        ctx.fillText(label, b.x, b.y - fontSize * 0.55);
        ctx.font = `500 ${Math.max(8, fontSize * 0.82)}px JetBrains Mono, monospace`;
        ctx.fillStyle = b.day >= 0 ? 'rgba(150,220,195,0.95)' : 'rgba(240,180,165,0.95)';
        ctx.fillText(pctText, b.x, b.y + fontSize * 0.65);
      } else {
        ctx.fillText(label, b.x, b.y);
      }
    }
  }
}
