import { STOCK_DOMAINS, NGX_SVG_SYMS, NGXPULSE_BASE } from '@/lib/data/stockDomains';

const _cache: Record<string, HTMLImageElement | null> = {};

/** Preload (or return cached) logo for a stock symbol. */
export function getBubbleLogo(sym: string): HTMLImageElement | null {
  if (sym in _cache) return _cache[sym];

  const domain = STOCK_DOMAINS[sym] || '';
  const ext = NGX_SVG_SYMS.has(sym) ? 'svg' : 'png';
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `${NGXPULSE_BASE}${sym}.${ext}`;

  img.onerror = () => {
    if (domain) {
      const cb = new Image();
      cb.crossOrigin = 'anonymous';
      cb.src = `https://logo.clearbit.com/${domain}`;
      cb.onload = () => { _cache[sym] = cb; };
      cb.onerror = () => {
        const gf = new Image();
        gf.crossOrigin = 'anonymous';
        gf.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        gf.onload = () => { _cache[sym] = gf; };
        gf.onerror = () => { _cache[sym] = null; };
      };
    } else {
      _cache[sym] = null;
    }
  };

  _cache[sym] = img;
  return img;
}

/**
 * Draw a company logo inside a bubble on a canvas context.
 * Returns true if the logo was drawn (fully loaded).
 */
export function drawBubbleLogo(
  ctx: CanvasRenderingContext2D,
  sym: string,
  bx: number,
  by: number,
  r: number
): boolean {
  const logo = getBubbleLogo(sym);
  if (!logo || !logo.complete || !logo.naturalWidth) return false;

  const ls = r * 0.52;
  const logoY = r >= 44 ? by - r * 0.16 : by - r * 0.1;

  ctx.save();
  ctx.beginPath();
  ctx.arc(bx, logoY, ls * 0.52, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.fill();
  ctx.drawImage(logo, bx - ls * 0.5, logoY - ls * 0.5, ls, ls);
  ctx.restore();
  return true;
}
