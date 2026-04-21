import type { FxRate } from '@/types/market';

export const fxData: FxRate[] = [
  {p:'USD/NGN',  r:'1,376.54', d:'-0.4%',   up:false},
  {p:'EUR/NGN',  r:'1,486.66', d:'+0.1%',   up:true},
  {p:'GBP/NGN',  r:'1,775.74', d:'-0.1%',   up:false},
  {p:'NGN/USD',  r:'0.000727', d:'+0.4%',   up:true},
  {p:'Brent Oil',r:'$74.15',   d:'+0.8%',   up:true},
  {p:'Inflation',r:'24.48%',   d:'Jan 2026', up:false},
  {p:'MPR',      r:'27.50%',   d:'CBN Rate', up:false},
];
