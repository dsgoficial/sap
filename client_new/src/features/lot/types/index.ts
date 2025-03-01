// Path: features\lot\types\index.ts
export interface LotSubphaseData {
  lote: string;
  subfase: string;
  month: number;
  count: number;
}

export interface LotTableData {
  lot: string;
  rows: {
    subphase: string;
    [key: string]: string | number; // Month values (jan, feb, etc.)
  }[];
}