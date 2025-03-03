// Path: types\microControl.ts
export interface Duration {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface RunningActivity {
  projeto_nome: string;
  lote: string;
  fase_nome: string;
  subfase_nome: string;
  etapa_nome: string;
  bloco: string;
  atividade_id: string;
  usuario: string;
  data_inicio: string;
  duracao: Duration;
}

export interface CompletedActivity {
  projeto_nome: string;
  lote: string;
  fase_nome: string;
  subfase_nome: string;
  etapa_nome: string;
  bloco: string;
  atividade_id: string;
  usuario: string;
  data_inicio: string;
  data_fim: string;
}

export interface FormattedRunningActivity
  extends Omit<RunningActivity, 'duracao'> {
  duration: string;
}
