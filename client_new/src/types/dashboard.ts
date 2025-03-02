// Path: types\dashboard.ts
export interface DashboardQuantityItem {
  lote: string;
  quantidade: number;
}

export interface DashboardFinishedItem {
  lote: string;
  finalizadas: number;
}

export interface DashboardRunningItem {
  lote: string;
  count: number;
}

export interface PitItem {
  projeto: string;
  lote: string;
  month: number;
  finalizadas: number;
  meta?: number;
}

export interface DashboardSummary {
  totalProducts: number;
  completedProducts: number;
  runningProducts: number;
  progressPercentage: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  lotProgressData: {
    name: string;
    completed: number;
    running: number;
    notStarted: number;
  }[];
  monthlyData: {
    month: string;
    [key: string]: any;
  }[];
}
