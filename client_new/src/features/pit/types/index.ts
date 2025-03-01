// Path: features\pit\types\index.ts
export interface PitItem {
    projeto: string;
    lote: string;
    month: number;
    finalizadas: number;
    meta?: number;
  }
  
  export interface PitTableData {
    project: string;
    rows: {
      lot: string;
      meta: number;
      [key: string]: string | number; // Month values
      count: number;
      percent: string;
    }[];
  }