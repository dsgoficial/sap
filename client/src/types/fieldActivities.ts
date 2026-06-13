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
  data_criacao?: string;
  orgao?: string;
  pit?: string;
  qtd_fotos?: number;
  qtd_track?: number;
  situacao?: string;
  geometry?: GeoJSON.Geometry;
  // Campos específicos para dados do GeoJSON feature properties
  inicio?: string;
  fim?: string;
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
