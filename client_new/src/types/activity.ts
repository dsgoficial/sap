// Path: types\activity.ts
/**
 * Activity entity
 */
export interface Activity {
    id: string;
    nome: string;
    projeto: string;
    lote: string;
    fase: string;
    subfase: string;
    etapa: string;
    bloco: string;
    data_inicio: string;
    data_fim?: string;
    usuario: string;
    dado_producao: {
      tipo_dado_producao_id: number;
    };
  }
  
  /**
   * Current activity response
   */
  export interface CurrentActivityResponse {
    atividade: Activity | null;
  }
  
  /**
   * Error report for an activity
   */
  export interface ErrorReport {
    atividade_id: string;
    tipo_problema_id: number;
    descricao: string;
  }
  
  /**
   * Error type definition
   */
  export interface ErrorType {
    tipo_problema_id: number;
    tipo_problema: string;
  }