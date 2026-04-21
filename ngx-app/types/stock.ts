export interface Stock {
  r: number;
  sym: string;
  co: string;
  sec: string;
  price: number;
  day: number;
  week: number;
  ytd: number;
  capN: string;
  capV: number;
  vol: string;
  volV: number;
  os: string;
  lo: number;
  hi: number;
  div: number;
  pe: number;
  up: boolean;
}

export type StocksAction =
  | { type: 'UPDATE_PRICES'; payload: { sym: string; price: number; day: number; up: boolean }[] }
  | { type: 'RESET' };

export interface BubbleState {
  sym: string;
  co: string;
  sec: string;
  price: number;
  day: number;
  week: number;
  capV: number;
  vol: string;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}
