import type { EarningsEvent } from '@/types/market';

export const earningsCalendar: EarningsEvent[] = [
  {date:'Mar 05', sym:'ACCESS',     co:'Access Holdings Plc',   type:'RESULTS',  typeClass:'et-results'},
  {date:'Mar 07', sym:'FIRSTHOLDCO',co:'First HoldCo Plc',      type:'RESULTS',  typeClass:'et-results'},
  {date:'Mar 12', sym:'MTNN',       co:'MTN Nigeria Comms',     type:'BOARD MTG',typeClass:'et-board'},
  {date:'Mar 14', sym:'NESTLE',     co:'Nestle Nigeria Plc',    type:'RESULTS',  typeClass:'et-results'},
  {date:'Mar 20', sym:'BUAFOODS',   co:'BUA Foods Plc',         type:'DIVIDEND', typeClass:'et-dividend'},
  {date:'Mar 25', sym:'SEPLAT',     co:'Seplat Energy Plc',     type:'AGM',      typeClass:'et-agm'},
  {date:'Apr 02', sym:'GTCO',       co:'Guaranty Trust Hldg',   type:'RESULTS',  typeClass:'et-results'},
  {date:'Apr 10', sym:'ZENITHBANK', co:'Zenith Bank Plc',       type:'DIVIDEND', typeClass:'et-dividend'},
  {date:'Apr 15', sym:'UBA',        co:'United Bank for Africa',type:'AGM',      typeClass:'et-agm'},
  {date:'Apr 18', sym:'DANGCEM',    co:'Dangote Cement Plc',    type:'RESULTS',  typeClass:'et-results'},
  {date:'Apr 30', sym:'NESTLE',     co:'Nestle Nigeria Plc',    type:'AGM',      typeClass:'et-agm'},
  {date:'May 05', sym:'BUAFOODS',   co:'BUA Foods Plc',         type:'RESULTS',  typeClass:'et-results'},
  {date:'May 12', sym:'WAPCO',      co:'Lafarge Africa Plc',    type:'RESULTS',  typeClass:'et-results'},
];
