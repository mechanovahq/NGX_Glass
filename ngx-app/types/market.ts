export interface SectorData {
  n: string;
  p: number;
  stocks: number;
  cap: string;
}

export interface Filing {
  type: string;
  typeClass: string;
  co: string;
  desc: string;
  date: string;
}

export interface NewsItem {
  headline: string;
  tag: string;
  tagLabel: string;
  tagClass: string;
  source: string;
  time: string;
  url?: string;
}

export interface EarningsEvent {
  date: string;
  sym: string;
  co: string;
  type: string;
  typeClass: string;
}

export interface FxRate {
  p: string;
  r: string;
  d: string;
  up: boolean;
}

export interface TBill {
  tenor: string;
  label: string;
  rate: number;
  prev: number;
  date: string;
  issuer: string;
}

export interface Bond {
  name: string;
  tenor: string;
  coupon: number;
  ytm: number;
  maturity: string;
  issuer: string;
  type: string;
}

export interface CommercialPaper {
  issuer: string;
  ticker: string;
  rating: string;
  tenor: string;
  rate: number;
  size: string;
  type: string;
}

export interface MoneyMarket {
  name: string;
  rate: number;
  prev: number;
  note: string;
  badge: string;
}

export interface FixedIncome {
  tbills: TBill[];
  bonds: Bond[];
  commercial: CommercialPaper[];
  money: MoneyMarket[];
}
