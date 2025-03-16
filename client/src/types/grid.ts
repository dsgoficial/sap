// Path: types\grid.ts
/**
 * Grid item representing a cell in the grid visualization
 */
export interface GridItem {
  i: number;
  j: number;
  visited: boolean;
  data_atualizacao?: string;
}

/**
 * Grid data representing the entire grid structure with metadata
 */
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
