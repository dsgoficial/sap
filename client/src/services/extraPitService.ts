// Path: services\extraPitService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';

export interface ExtraPit {
  id: number;
  ano: number;
  demandante: string;
  tipo_produto: string;
  quantidade: number;
  situacao_id: number;
  situacao?: string;
  documento_autorizacao: string;
  descricao: string | null;
  lote_id: number | null;
  lote_nome?: string | null;
}

export type ExtraPitInput = Omit<
  ExtraPit,
  'id' | 'situacao' | 'lote_nome'
>;

export interface SituacaoExtraPit {
  code: number;
  nome: string;
}

export const getExtraPitByAno = async (ano: number): Promise<ExtraPit[]> => {
  const response = await apiClient.get<ApiResponse<ExtraPit[]>>(
    `/extra_pit/${ano}`,
  );
  return response.data.dados;
};

export const getSituacoesExtraPit = async (): Promise<SituacaoExtraPit[]> => {
  const response = await apiClient.get<ApiResponse<SituacaoExtraPit[]>>(
    '/extra_pit/situacao',
  );
  return response.data.dados;
};

export const criarExtraPit = async (
  extra_pit: ExtraPitInput,
): Promise<void> => {
  await apiClient.post('/extra_pit', { extra_pit });
};

export const atualizarExtraPit = async (
  id: number,
  extra_pit: ExtraPitInput,
): Promise<void> => {
  await apiClient.put(`/extra_pit/${id}`, { extra_pit });
};

export const deletarExtraPit = async (id: number): Promise<void> => {
  await apiClient.delete(`/extra_pit/${id}`);
};
