import type { FixedIncome } from '@/types/market';

export const FIXED_INCOME: FixedIncome = {
  tbills: [
    {tenor:'91-Day',  label:'3 Months',  rate:17.52, prev:17.45, date:'Feb 26 2026', issuer:'FGN / CBN'},
    {tenor:'182-Day', label:'6 Months',  rate:18.25, prev:18.10, date:'Feb 26 2026', issuer:'FGN / CBN'},
    {tenor:'364-Day', label:'12 Months', rate:19.48, prev:19.44, date:'Feb 26 2026', issuer:'FGN / CBN'},
  ],
  bonds: [
    {name:'FGN Savings Bond',  tenor:'2-Yr',  coupon:18.45, ytm:18.45, maturity:'Mar 2028', issuer:'DMO',       type:'dmo'},
    {name:'FGN Savings Bond',  tenor:'3-Yr',  coupon:19.12, ytm:19.12, maturity:'Mar 2029', issuer:'DMO',       type:'dmo'},
    {name:'FGN Bond Mar 2027', tenor:'5-Yr',  coupon:13.98, ytm:18.75, maturity:'Mar 2027', issuer:'FGN',       type:'govt'},
    {name:'FGN Bond Jul 2030', tenor:'7-Yr',  coupon:14.55, ytm:19.10, maturity:'Jul 2030', issuer:'FGN',       type:'govt'},
    {name:'FGN Bond Jan 2032', tenor:'10-Yr', coupon:16.25, ytm:19.80, maturity:'Jan 2032', issuer:'FGN',       type:'govt'},
    {name:'FGN Bond Feb 2037', tenor:'15-Yr', coupon:16.00, ytm:20.45, maturity:'Feb 2037', issuer:'FGN',       type:'govt'},
    {name:'FGN Bond Apr 2042', tenor:'20-Yr', coupon:16.29, ytm:20.95, maturity:'Apr 2042', issuer:'FGN',       type:'govt'},
    {name:'Sukuk 2032',        tenor:'7-Yr',  coupon:15.74, ytm:19.40, maturity:'Dec 2032', issuer:'FGN Sukuk', type:'dmo'},
  ],
  commercial: [
    {issuer:'Dangote Industries', ticker:'DANGOTE',  rating:'A+',  tenor:'180-Day', rate:20.50, size:'₦50.0B', type:'corp'},
    {issuer:'MTN Nigeria',        ticker:'MTNN',     rating:'AA',  tenor:'270-Day', rate:21.00, size:'₦30.0B', type:'corp'},
    {issuer:'Flour Mills Nig.',   ticker:'FLOURMILL',rating:'A',   tenor:'90-Day',  rate:21.80, size:'₦15.0B', type:'corp'},
    {issuer:'Access Holdings',    ticker:'ACCESS',   rating:'AA-', tenor:'180-Day', rate:20.20, size:'₦40.0B', type:'corp'},
    {issuer:'Zenith Bank',        ticker:'ZENITH',   rating:'AA',  tenor:'180-Day', rate:19.90, size:'₦35.0B', type:'corp'},
    {issuer:'FCMB Group',         ticker:'FCMB',     rating:'A',   tenor:'91-Day',  rate:22.00, size:'₦10.0B', type:'corp'},
    {issuer:'BUA Foods',          ticker:'BUAFOODS', rating:'A+',  tenor:'365-Day', rate:20.75, size:'₦25.0B', type:'corp'},
    {issuer:'Transcorp',          ticker:'TRANSCORP',rating:'A-',  tenor:'270-Day', rate:22.50, size:'₦8.0B',  type:'corp'},
  ],
  money: [
    {name:'CBN Monetary Policy Rate',  rate:27.50, prev:27.50, note:'Policy Rate', badge:'mm'},
    {name:'CBN Standing Deposit Fac.', rate:18.75, prev:18.75, note:'SDF Floor',   badge:'mm'},
    {name:'CBN Standing Lending Fac.', rate:28.50, prev:28.50, note:'SLF Ceiling', badge:'mm'},
    {name:'NIBOR Overnight',           rate:26.82, prev:27.14, note:'Interbank',   badge:'mm'},
    {name:'NIBOR 1-Month',             rate:27.18, prev:27.10, note:'Interbank',   badge:'mm'},
    {name:'NIBOR 3-Month',             rate:27.44, prev:27.38, note:'Interbank',   badge:'mm'},
    {name:'NIBOR 6-Month',             rate:27.81, prev:27.75, note:'Interbank',   badge:'mm'},
    {name:'Open Buy-Back (OBB)',        rate:26.50, prev:27.00, note:'Repo',       badge:'mm'},
    {name:'Secured Lending Rate',      rate:27.00, prev:27.50, note:'CBN Repo',    badge:'mm'},
    {name:'Min. Savings Deposit Rate', rate:13.75, prev:13.75, note:'Deposit',     badge:'mm'},
  ],
};
