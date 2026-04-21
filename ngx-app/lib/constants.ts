export const SECTOR_COLORS: Record<string, string> = {
  'Banking':      '#5a8fd4',
  'Telecoms':     '#8b7fd4',
  'Industrial':   '#c9a961',
  'Oil & Gas':    '#c5563e',
  'Consumer':     '#4a9d7c',
  'Insurance':    '#6bb8c4',
  'Utilities':    '#c9a961',
  'Financial':    '#b87fd4',
  'Healthcare':   '#7ab87a',
  'Conglomerate': '#a07fd4',
  'Agriculture':  '#6ab8a0',
  'Unknown':      '#5f5e5a',
};

// Tessera palette: brass for gains, coral-rust for losses
export function bubbleColor(pct: number, alpha = 1): string {
  if (pct > 8)  return `rgba(58,130,100,${alpha})`;   // deep teal
  if (pct > 4)  return `rgba(74,157,124,${alpha})`;   // teal-green
  if (pct > 1)  return `rgba(90,175,145,${alpha})`;   // mid teal
  if (pct > 0)  return `rgba(110,190,162,${alpha})`;  // light teal
  if (pct > -1) return `rgba(210,130,110,${alpha})`;  // light coral
  if (pct > -4) return `rgba(197,86,62,${alpha})`;    // coral-rust
  if (pct > -8) return `rgba(175,64,44,${alpha})`;    // dark coral
  return `rgba(150,48,32,${alpha})`;                  // deep coral
}

export function glowColor(pct: number): string {
  return pct >= 0 ? 'rgba(74,157,124,0.35)' : 'rgba(197,86,62,0.35)';
}
