/** Abbreviate large numbers: 1234567 → "1.23M", 4500000000 → "4.50B" */
export function pfAbbr(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toLocaleString();
}

/** Format a price to 2 decimal places */
export function fmtPrice(price: number): string {
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format a percentage change with sign prefix */
export function fmtPct(pct: number, decimals = 2): string {
  return (pct >= 0 ? '+' : '') + pct.toFixed(decimals) + '%';
}

/** Format market cap: capV (billions) → "₦1.23T" or "₦456B" */
export function fmtCap(capV: number): string {
  if (capV >= 1000) return '₦' + (capV / 1000).toFixed(1) + 'T';
  return '₦' + capV + 'B';
}
