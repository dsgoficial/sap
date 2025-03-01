// Path: features\map\types\index.ts
export interface ViewInfo {
    nome: string;
    lote: string;
    tipo: string;
  }
  
  export interface ViewsResponse {
    views: ViewInfo[];
  }
  
  export interface GeoJSONData {
    geojson: GeoJSON.FeatureCollection;
  }
  
  export interface MapLayer {
    id: string;
    name: string;
    geojson: GeoJSON.FeatureCollection;
    visible?: boolean;
  }
  
  export interface MapLayerProperties {
    f_1_preparo_data_inicio?: string | null;
    f_1_preparo_data_fim?: string | null;
    f_2_extracao_data_inicio?: string | null;
    f_2_extracao_data_fim?: string | null;
    f_3_validacao_data_inicio?: string | null;
    f_3_validacao_data_fim?: string | null;
    f_4_disseminacao_data_inicio?: string | null;
    f_4_disseminacao_data_fim?: string | null;
    [key: string]: any;
  }
  
  export interface MapViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
  }
  
  export interface LegendItem {
    label: string;
    color: string;
    border: boolean;
  }