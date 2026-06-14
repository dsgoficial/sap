// Path: services\capacitacaoService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';

export interface Capacitacao {
  id: string;
  nome: string;
  tipo: 'Ministrada' | 'Recebida';
  instituicoes: string | null;
  local: string | null;
  inicio: string | null;
  fim: string | null;
  efetivo_capacitado: number | null;
  militares: string | null;
  plano_codigo: string | null;
  ano: number;
  situacao_id: number;
  situacao?: string;
  documento: string | null;
}

export type CapacitacaoInput = Omit<Capacitacao, 'id' | 'situacao'>;

export interface SituacaoCapacitacao {
  code: number;
  nome: string;
}

export const getCapacitacoes = async (): Promise<Capacitacao[]> => {
  const response = await apiClient.get<ApiResponse<Capacitacao[]>>(
    '/capacitacao/capacitacoes',
  );
  return response.data.dados;
};

export const getSituacoesCapacitacao = async (): Promise<
  SituacaoCapacitacao[]
> => {
  const response = await apiClient.get<ApiResponse<SituacaoCapacitacao[]>>(
    '/capacitacao/situacao',
  );
  return response.data.dados;
};

export const criarCapacitacao = async (
  capacitacao: CapacitacaoInput,
): Promise<void> => {
  await apiClient.post('/capacitacao/capacitacoes', { capacitacao });
};

export const atualizarCapacitacao = async (
  id: string,
  capacitacao: CapacitacaoInput,
): Promise<void> => {
  await apiClient.put(`/capacitacao/capacitacoes/${id}`, { capacitacao });
};

export const deletarCapacitacao = async (id: string): Promise<void> => {
  await apiClient.delete(`/capacitacao/capacitacoes/${id}`);
};
