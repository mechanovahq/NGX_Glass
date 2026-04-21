/** WAT = UTC+1, no DST */
const WAT_OFFSET = 1 * 60; // minutes

export function getNowWAT(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utcMs + WAT_OFFSET * 60_000);
}

/** NGX trading session: Mon–Fri 10:00–14:30 WAT */
export function isMarketOpen(): boolean {
  const wat = getNowWAT();
  const day = wat.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const h = wat.getHours(), m = wat.getMinutes();
  const mins = h * 60 + m;
  return mins >= 10 * 60 && mins < 14 * 60 + 30;
}

/** Human-readable WAT time string e.g. "14:22:05 WAT" */
export function watTimeString(): string {
  const wat = getNowWAT();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(wat.getHours())}:${pad(wat.getMinutes())}:${pad(wat.getSeconds())} WAT`;
}

/** Weekday name in WAT */
export function watWeekday(): string {
  return getNowWAT().toLocaleDateString('en-US', { weekday: 'long' });
}

/** Returns next market open label, e.g. "Opens Monday 10:00 WAT" */
export function nextOpenLabel(): string {
  const wat = getNowWAT();
  const day = wat.getDay();
  const h = wat.getHours(), m = wat.getMinutes();
  const mins = h * 60 + m;

  if (day >= 1 && day <= 5 && mins < 10 * 60) return 'Opens 10:00 WAT today';
  if (day >= 1 && day <= 4 && mins >= 14 * 60 + 30) return 'Opens 10:00 WAT tomorrow';
  if (day === 5 && mins >= 14 * 60 + 30) return 'Opens 10:00 WAT Monday';
  if (day === 6) return 'Opens 10:00 WAT Monday';
  if (day === 0) return 'Opens 10:00 WAT tomorrow';
  return 'Opens 10:00 WAT';
}
