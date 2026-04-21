export interface BubbleStock {
  sym: string;
  co: string;
  sec: string;
  price: number;
  day: number;
  cap: number;
  vol: string;
}

export const BUBBLE_STOCKS: BubbleStock[] = [
  // Banking
  {sym:'ZENITHBANK',  co:'Zenith Bank',      sec:'Banking',    price:91.95,   day:1.04,  cap:4360, vol:'79.4M'},
  {sym:'GTCO',        co:'GT Holdings',      sec:'Banking',    price:117.95,  day:0.81,  cap:6980, vol:'18.3M'},
  {sym:'UBA',         co:'United Bank',      sec:'Banking',    price:47.20,   day:-3.27, cap:3740, vol:'22.1M'},
  {sym:'ACCESSCORP',  co:'Access Holdings',  sec:'Banking',    price:25.95,   day:-2.07, cap:2360, vol:'31.7M'},
  {sym:'FIRSTHOLDCO', co:'First HoldCo',     sec:'Banking',    price:53.75,   day:-0.37, cap:1930, vol:'14.8M'},
  {sym:'FIDELITYBK',  co:'Fidelity Bank',    sec:'Banking',    price:20.00,   day:0.25,  cap:1140, vol:'9.6M'},
  {sym:'FCMB',        co:'FCMB Group',       sec:'Banking',    price:13.50,   day:-2.88, cap:788,  vol:'5.1M'},
  {sym:'STERLINGNG',  co:'Sterling Fin.',    sec:'Banking',    price:8.35,    day:-1.76, cap:291,  vol:'3.2M'},
  {sym:'WEMABANK',    co:'Wema Bank',        sec:'Banking',    price:27.95,   day:3.51,  cap:609,  vol:'5.4M'},
  {sym:'JAIZBANK',    co:'Jaiz Bank',        sec:'Banking',    price:12.63,   day:0.00,  cap:1120, vol:'4.8M'},
  {sym:'ETI',         co:'Ecobank Trans.',   sec:'Banking',    price:48.00,   day:0.00,  cap:1310, vol:'4.2M'},
  // Telecoms
  {sym:'MTNN',        co:'MTN Nigeria',      sec:'Telecoms',   price:783.00,  day:3.02,  cap:16840,vol:'12.4M'},
  {sym:'AIRTELAFRI',  co:'Airtel Africa',    sec:'Telecoms',   price:2270.00, day:0.00,  cap:8530, vol:'0.8M'},
  // Industrial
  {sym:'DANGCEM',     co:'Dangote Cement',   sec:'Industrial', price:809.90,  day:3.97,  cap:17330,vol:'8.2M'},
  {sym:'BUACEMENT',   co:'BUA Cement',       sec:'Industrial', price:219.00,  day:0.00,  cap:8430, vol:'5.6M'},
  {sym:'WAPCO',       co:'Lafarge Africa',   sec:'Industrial', price:207.50,  day:3.75,  cap:3330, vol:'6.3M'},
  // Oil & Gas
  {sym:'SEPLAT',      co:'Seplat Energy',    sec:'Oil & Gas',  price:9099.90, day:0.00,  cap:7880, vol:'0.4M'},
  {sym:'ARADEL',      co:'Aradel Holdings',  sec:'Oil & Gas',  price:1300.00, day:9.04,  cap:7640, vol:'1.9M'},
  {sym:'OANDO',       co:'Oando Plc',        sec:'Oil & Gas',  price:45.70,   day:9.34,  cap:1200, vol:'3.4M'},
  {sym:'JAPAULGOLD',  co:'Japaul Gold',      sec:'Oil & Gas',  price:3.99,    day:3.37,  cap:177,  vol:'57.2M'},
  {sym:'CONOIL',      co:'Conoil Plc',       sec:'Oil & Gas',  price:169.00,  day:0.00,  cap:369,  vol:'0.6M'},
  // Consumer
  {sym:'BUAFOODS',    co:'BUA Foods',        sec:'Consumer',   price:789.40,  day:0.00,  cap:14210,vol:'2.1M'},
  {sym:'NESTLE',      co:'Nestle Nigeria',   sec:'Consumer',   price:3100.00, day:0.00,  cap:2470, vol:'0.2M'},
  {sym:'NASCON',      co:'NASCON Allied',    sec:'Consumer',   price:164.95,  day:0.00,  cap:792,  vol:'1.4M'},
  {sym:'CHAMPION',    co:'Champion Brew',    sec:'Consumer',   price:17.00,   day:-5.56, cap:325,  vol:'3.8M'},
  {sym:'PRESCO',      co:'Presco Plc',       sec:'Agriculture',price:2315.40, day:0.00,  cap:1820, vol:'0.2M'},
  {sym:'GUINNESS',    co:'Guinness Nigeria', sec:'Consumer',   price:350.00,  day:0.00,  cap:980,  vol:'0.4M'},
  {sym:'OKOMUOIL',    co:'Okomu Oil Palm',   sec:'Agriculture',price:1765.00, day:0.00,  cap:1650, vol:'0.2M'},
  // Others
  {sym:'GEREGU',      co:'Geregu Power',     sec:'Utilities',  price:1141.50, day:0.00,  cap:3700, vol:'1.1M'},
  {sym:'NGXGROUP',    co:'NGX Group',        sec:'Financial',  price:136.40,  day:10.00, cap:268,  vol:'3.2M'},
  {sym:'STANBIC',     co:'Stanbic IBTC',     sec:'Financial',  price:126.00,  day:3.28,  cap:1180, vol:'1.8M'},
  {sym:'AIICO',       co:'AIICO Insurance',  sec:'Insurance',  price:4.43,    day:0.23,  cap:182,  vol:'8.4M'},
  {sym:'CUSTODIAN',   co:'Custodian Inv.',   sec:'Insurance',  price:61.20,   day:-10.00,cap:795,  vol:'2.6M'},
  {sym:'MECURE',      co:'MeCure Industries',sec:'Healthcare', price:75.85,   day:-9.97, cap:180,  vol:'0.3M'},
  {sym:'TRANSCORP',   co:'Transcorp Plc',    sec:'Conglomerate',price:53.90,  day:6.63,  cap:857,  vol:'6.8M'},
];
