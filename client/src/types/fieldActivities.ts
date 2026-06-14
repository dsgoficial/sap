// Path: types\fieldActivities.ts
/**
 * Campo (Field) entity
 */
export interface Campo {
  id: string;
  nome: string;
  descricao?: string;
  situacao_id: number;
  categoria_id?: number;
  categorias?: string[];
  data_criacao?: string;
  orgao?: string;
  pit?: number;
  militares?: string;
  placas_vtr?: string;
  qtd_fotos?: number;
  qtd_track?: number;
  produtos_associados?: number;
  situacao?: string;
  geometry?: GeoJSON.Geometry;
  // Campos específicos para dados do GeoJSON feature properties
  inicio?: string;
  fim?: string;
}

/**
 * Payload para criar/editar um campo (sem geometria — desenhada no QGIS)
 */
export interface CampoInput {
  nome: string;
  descricao: string | null;
  orgao: string;
  pit: number;
  militares: string | null;
  placas_vtr: string | null;
  inicio: string | null;
  fim: string | null;
  situacao_id: number;
  categorias: string[];
  geom?: string | null;
}

/**
 * Produto pertencente a um lote (seletor de associação)
 */
export interface ProdutoLote {
  id: number;
  nome: string;
}

/**
 * Lote (lista resumida de /projeto/lote)
 */
export interface Lote {
  id: number;
  nome: string;
  nome_abrev?: string;
  status?: string;
}

/**
 * Associação produto-campo retornada pela API
 */
export interface ProdutoCampo {
  id: number;
  produto_nome: string;
  nome: string;
  nome_lote: string;
}

/**
 * Payload de associação produto-campo
 */
export interface AssociacaoInput {
  campo_id: string;
  produto_id: number;
}

/**
 * Item de contagem usado nas estatísticas
 */
export interface EstatisticaItem {
  quantidade: number;
  situacao?: string;
  categoria?: string;
  orgao?: string;
  pit?: number;
}

/**
 * Estatísticas agregadas dos campos
 */
export interface EstatisticasCampos {
  total_campos: number;
  area_total_km2: number | null;
  por_situacao: EstatisticaItem[];
  por_categoria: EstatisticaItem[];
  por_orgao: EstatisticaItem[];
  por_pit: EstatisticaItem[];
}

/**
 * Payload para criação de foto (upload via base64)
 */
export interface FotoInput {
  campo_id: string;
  descricao: string;
  data_imagem: string;
  imagem_base64: string;
}

/**
 * Foto (Photo) entity
 */
export interface Foto {
  id: string;
  campo_id: string;
  descricao?: string;
  data_imagem?: string;
  nome?: string;
  url?: string;
  imagem_bin?: any; // Binary data for image
}

/**
 * Track entity
 */
export interface Track {
  id: string;
  campo_id: string;
  nome?: string;
  descricao?: string;
  track_id_garmin?: string;
  min_t?: string;
  max_t?: string;
  data?: any; // Track data
  chefe_vtr?: string; // Chefe da viatura
  motorista?: string; // Motorista
  placa_vtr?: string; // Placa da viatura
  dia?: string;
}

/**
 * Situação (Status) entity — backend retorna { code, nome }
 */
export interface Situacao {
  code: number;
  nome: string;
}

/**
 * Categoria (Category) entity — backend retorna { categoria }
 */
export interface Categoria {
  categoria: string;
}

/**
 * GeoJSON response for map
 */
export interface CamposGeoJSONResponse
  extends GeoJSON.FeatureCollection<GeoJSON.Geometry, Campo> {
  // Garantir que seja compatível com GeoJSON.FeatureCollection exato
  type: 'FeatureCollection';
}

/**
 * API responses
 */
export interface FotosResponse {
  dados: Foto[];
  success: boolean;
  message: string;
}

export interface TracksResponse {
  dados: Track[];
  success: boolean;
  message: string;
}

export interface CamposGeoJSONApiResponse {
  dados: CamposGeoJSONResponse;
  success: boolean;
  message: string;
}
