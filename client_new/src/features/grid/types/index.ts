// Path: features\grid\types\index.ts
export interface GridItem {
  i: number;
  j: number;
  visited: boolean;
  data_atualizacao?: string;
}

export interface GridData {
  grade: GridItem[];
  data_inicio?: string;
  usuario?: string;
  projeto?: string;
  lote?: string;
  fase?: string;
  bloco?: string;
  subfase?: string;
  etapa?: string;
  selectedItem?: GridItem; // For storing the currently selected item
}

export interface StatisticsGridResponse {
  dados: GridData[];
  message: string;
  success: boolean;
}