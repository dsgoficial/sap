// Path: features\subphases\types\index.ts
export interface SubphaseData {
  lote: string;
  subfase: string;
  data: Array<[string, string, string]>; // [start_date, status, end_date]
}

export interface SubphaseSituationItem {
  bloco: string;
  subfase: string;
  finalizadas: number;
  nao_finalizadas?: number;
}

export interface UserActivityData {
  usuario: string;
  data: Array<[string, string, string]>; // [start_date, status, end_date]
}

export interface TimelineGroup {
  idContainer: string;
  idBar: string;
  title: string;
  options: {
    title: {
      text: string;
    };
    id_div_container: string;
    id_div_graph: string;
    date_in_utc: boolean;
    line_spacing: number;
    tooltip: {
      height: number;
      position: string;
      left_spacing: number;
      only_first_date: boolean;
      date_plus_time: boolean;
    };
    responsive: {
      enabled: boolean;
    };
  };
  dataset: {
    measure: string;
    data: Array<[string, string, string]>;
  }[];
}

export interface ChartPoint {
  label: string;
  y: number;
}

export interface ChartGroup {
  title: string;
  dataPointA: ChartPoint[];
  dataPointB: ChartPoint[];
}