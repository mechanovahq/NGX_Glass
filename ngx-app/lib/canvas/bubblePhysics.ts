import type { BubbleState } from '@/types/stock';

export interface BubbleInput {
  sym: string;
  co: string;
  sec: string;
  price: number;
  day: number;
  week?: number;
  capV?: number;
  cap?: number;
  vol: string;
  r?: number;
}

/** Initialise bubble positions + velocities from stock data */
export function initBubbles(
  data: BubbleInput[],
  width: number,
  height: number
): BubbleState[] {
  const caps = data.map(d => d.capV ?? d.cap ?? 1);
  const maxCap = Math.max(...caps, 1);
  const minR = 22;
  const maxR = Math.min(width * 0.14, 80);

  return data.map((d, i) => {
    const cap = caps[i];
    const radius = minR + Math.sqrt(cap / maxCap) * (maxR - minR);
    return {
      sym: d.sym,
      co: d.co,
      sec: d.sec,
      price: d.price,
      day: d.day,
      week: d.week ?? 0,
      capV: cap,
      vol: d.vol,
      r: d.r ?? 0,
      x: radius + Math.random() * (width - radius * 2),
      y: radius + Math.random() * (height - radius * 2),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius,
    };
  });
}

/** Run one physics tick. Mutates the bubbles array in place. */
export function tickPhysics(bubbles: BubbleState[], width: number, height: number): void {
  const cx = width / 2, cy = height / 2;

  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i];
    // Gentle center gravity
    b.vx += (cx - b.x) * 0.0004;
    b.vy += (cy - b.y) * 0.0004;

    // Bubble-to-bubble repulsion
    for (let j = i + 1; j < bubbles.length; j++) {
      const o = bubbles[j];
      const dx = b.x - o.x, dy = b.y - o.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = b.radius + o.radius + 4;
      if (dist < minDist && dist > 0) {
        const force = (minDist - dist) / dist * 0.06;
        b.vx += dx * force; b.vy += dy * force;
        o.vx -= dx * force; o.vy -= dy * force;
      }
    }

    // Damping
    b.vx *= 0.92; b.vy *= 0.92;
    b.x += b.vx; b.y += b.vy;

    // Wall bounce
    if (b.x - b.radius < 0)       { b.x = b.radius; b.vx *= -0.5; }
    if (b.x + b.radius > width)    { b.x = width - b.radius; b.vx *= -0.5; }
    if (b.y - b.radius < 0)        { b.y = b.radius; b.vy *= -0.5; }
    if (b.y + b.radius > height)   { b.y = height - b.radius; b.vy *= -0.5; }
  }
}

/** Variant used by heatmap: larger range (minR=20, maxR proportional to 0.12*width) */
export function initHeatmapBubbles(
  data: BubbleInput[],
  width: number,
  height: number
): BubbleState[] {
  const caps = data.map(d => d.capV ?? d.cap ?? 1);
  const maxCap = Math.max(...caps, 1);
  const minR = 20;
  const maxR = Math.min(width * 0.12, 75);

  return data.map((d, i) => {
    const cap = caps[i];
    const radius = minR + Math.sqrt(cap / maxCap) * (maxR - minR);
    return {
      sym: d.sym,
      co: d.co,
      sec: d.sec,
      price: d.price,
      day: d.day,
      week: d.week ?? 0,
      capV: cap,
      vol: d.vol,
      r: d.r ?? 0,
      x: radius + Math.random() * (width - radius * 2),
      y: radius + Math.random() * (height - radius * 2),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius,
    };
  });
}
