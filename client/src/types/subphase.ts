// Path: types\subphase.ts
/**
 * Subphase data for timeline visualization
 */
export interface SubphaseData {
  lote: string;
  subfase: string;
  data: Array<[string, string, string]>; // [start_date, status, end_date]
}

/**
 * Timeline group data for visavail visualization
 */
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

/**
 * Chart point for bar/pie chart visualizations
 * Used internally within ChartGroup
 */
interface ChartPoint {
  label: string;
  y: number;
}

/**
 * Chart group for stacked bar charts
 */
export interface ChartGroup {
  title: string;
  dataPointA: ChartPoint[];
  dataPointB: ChartPoint[];
}
