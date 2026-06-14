// Path: types\microControlTelemetry.ts
// Tipos da telemetria de microcontrole (feicao e tela). Espelham o contrato dos
// endpoints GET /microcontrole/* do backend (todos exigem token de admin).

/**
 * Filtros comuns das consultas de microcontrole. Datas no formato YYYY-MM-DD.
 */
export interface MicroControlTelemetryFilters {
  lote_id?: number | null;
  data_inicio?: string;
  data_fim?: string;
}

/**
 * Uma linha do resumo de feicao agregada por operador.
 */
export interface FeicaoResumoPorOperador {
  usuario_id: number;
  usuario: string;
  insercoes: number;
  delecoes: number;
  atualizacoes_atributo: number;
  atualizacoes_geometria: number;
  comprimento: number;
  vertices: number;
}

/**
 * Uma linha do resumo de feicao agregada por camada.
 */
export interface FeicaoResumoPorCamada {
  camada: string;
  insercoes: number;
  delecoes: number;
  atualizacoes_atributo: number;
  atualizacoes_geometria: number;
  comprimento: number;
  vertices: number;
}

/**
 * Um ponto da serie diaria de operacoes de feicao.
 */
export interface FeicaoResumoSerieDiaria {
  dia: string; // YYYY-MM-DD
  insercoes: number;
  delecoes: number;
  atualizacoes_atributo: number;
  atualizacoes_geometria: number;
}

/**
 * Resposta do endpoint GET /microcontrole/feicao/resumo.
 */
export interface FeicaoResumo {
  por_operador: FeicaoResumoPorOperador[];
  por_camada: FeicaoResumoPorCamada[];
  serie_diaria: FeicaoResumoSerieDiaria[];
}

/**
 * Propriedades de cada feicao da cobertura de tela.
 */
export interface TelaCoberturaProperties {
  atividade_id: number;
  usuario_id: number;
  usuario: string;
  data: string;
  zoom: number;
}

/**
 * Resposta do endpoint GET /microcontrole/tela/cobertura.
 * E um FeatureCollection GeoJSON com um campo extra `aviso` (truncamento).
 */
export interface TelaCobertura
  extends GeoJSON.FeatureCollection<
    GeoJSON.Polygon,
    TelaCoberturaProperties
  > {
  aviso: string | null;
}

/**
 * Filtros da cobertura de tela (lote, operador e intervalo).
 */
export interface TelaCoberturaFilters extends MicroControlTelemetryFilters {
  usuario_id?: number | null;
}

/**
 * Um ponto da serie diaria de aproveitamento de tela de um operador.
 */
export interface TelaAproveitamento {
  dia: string; // YYYY-MM-DD
  tempo_total_min: number;
  tempo_ativo_min: number;
  aproveitamento_pct: number;
}
