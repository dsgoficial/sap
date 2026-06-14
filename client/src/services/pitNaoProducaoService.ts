// Path: services\pitNaoProducaoService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';

// Uma meta do PIT que o SAP nao calcula (macrocontrole.pit com lote_id nulo): a
// definicao mais o realizado do ano ja agregado pelo backend (realizado e %).
export interface MetaNaoProducao {
  id: number;
  ano: number;
  numero_meta: number;
  item: string;
  descricao: string;
  unidade: string | null;
  meta: number;
  prazo: string | null;
  realizado: number;
  percentual: number | null;
}

export interface MetaNaoProducaoInput {
  ano: number;
  numero_meta: number;
  item: string;
  descricao: string;
  unidade: string | null;
  meta: number;
  prazo: string | null;
}

// Uma linha do grid de lancamento de um mes (a meta + o realizado daquele mes).
export interface ExecucaoLinha {
  pit_id: number;
  numero_meta: number;
  item: string;
  descricao: string;
  unidade: string | null;
  meta: number;
  prazo: string | null;
  execucao_id: number | null;
  quantidade: number | null;
  data_conclusao: string | null;
  observacao: string | null;
}

export interface ExecucaoInput {
  pit_id: number;
  mes: number;
  quantidade: number;
  data_conclusao: string | null;
  observacao: string | null;
}

export const getMetasNaoProducao = async (
  ano: number,
): Promise<MetaNaoProducao[]> => {
  const response = await apiClient.get<ApiResponse<MetaNaoProducao[]>>(
    `/pit_nao_producao/${ano}`,
  );
  return response.data.dados;
};

export const criarMeta = async (pit: MetaNaoProducaoInput): Promise<void> => {
  await apiClient.post('/pit_nao_producao', { pit });
};

export const atualizarMeta = async (
  id: number,
  pit: MetaNaoProducaoInput,
): Promise<void> => {
  await apiClient.put(`/pit_nao_producao/${id}`, { pit });
};

export const deletarMeta = async (id: number): Promise<void> => {
  await apiClient.delete(`/pit_nao_producao/${id}`);
};

export const getExecucaoMensal = async (
  ano: number,
  mes: number,
): Promise<ExecucaoLinha[]> => {
  const response = await apiClient.get<ApiResponse<ExecucaoLinha[]>>(
    `/pit_nao_producao/execucao/${ano}/${mes}`,
  );
  return response.data.dados;
};

export const salvarExecucao = async (
  execucao: ExecucaoInput,
): Promise<void> => {
  await apiClient.post('/pit_nao_producao/execucao', { execucao });
};

export const deletarExecucao = async (id: number): Promise<void> => {
  await apiClient.delete(`/pit_nao_producao/execucao/${id}`);
};
