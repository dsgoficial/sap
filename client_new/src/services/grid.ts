// Path: services\grid.ts
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
    selectedItem?: GridItem; // Para armazenar o item atualmente selecionado
  }
  
  export interface StatisticsGridResponse {
    dados: GridData[];
    message: string;
    success: boolean;
  }