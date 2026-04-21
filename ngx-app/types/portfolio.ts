export interface Holding {
  sym: string;
  shares: number;
  avgCost: number;
  buyDate?: string;
  note?: string;
}

export interface EnrichedHolding extends Holding {
  currentPrice: number;
  mktValue: number;
  costBasis: number;
  plN: number;
  plPct: number;
  dayChange: number;
  sector: string;
  co: string;
  divYield: number;
  pe: number;
}

export interface Transaction {
  sym: string;
  shares: number;
  price: number;
  date: string;
  type: 'BUY' | 'SELL';
  note?: string;
}
