// Path: services\personnelService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';

// Uma linha da Secao 5.1 do RPCMTec (retrato mensal): um militar num mes.
export interface AproveitamentoLinha {
  id: number;
  usuario_id: number;
  tipo_posto_grad_id: number;
  posto: string;
  nome_guerra: string;
  atividades: string | null;
}

export interface AproveitamentoInput {
  ano: number;
  mes: number;
  usuario_id: number;
  tipo_posto_grad_id?: number | null;
  atividades: string | null;
}

export interface UsuarioResumo {
  id: number;
  nome: string;
  nome_guerra?: string;
  ativo?: boolean;
}

export const getAproveitamento = async (
  ano: number,
  mes: number,
): Promise<AproveitamentoLinha[]> => {
  const response = await apiClient.get<ApiResponse<AproveitamentoLinha[]>>(
    `/rh/aproveitamento/${ano}/${mes}`,
  );
  return response.data.dados;
};

export const getUsuarios = async (): Promise<UsuarioResumo[]> => {
  const response = await apiClient.get<ApiResponse<UsuarioResumo[]>>(
    '/usuarios',
  );
  return response.data.dados;
};

export const criarLinha = async (
  aproveitamento: AproveitamentoInput,
): Promise<void> => {
  await apiClient.post('/rh/aproveitamento', { aproveitamento });
};

export const atualizarLinha = async (
  id: number,
  aproveitamento: { atividades: string | null; tipo_posto_grad_id?: number | null },
): Promise<void> => {
  await apiClient.put(`/rh/aproveitamento/${id}`, { aproveitamento });
};

export const deletarLinha = async (id: number): Promise<void> => {
  await apiClient.delete(`/rh/aproveitamento/${id}`);
};

export const copiarMesAnterior = async (
  ano: number,
  mes: number,
): Promise<{ copiados: number }> => {
  const response = await apiClient.post<ApiResponse<{ copiados: number }>>(
    '/rh/aproveitamento/copiar',
    { ano, mes },
  );
  return response.data.dados;
};

export const iniciarDoEfetivo = async (
  ano: number,
  mes: number,
): Promise<{ criados: number }> => {
  const response = await apiClient.post<ApiResponse<{ criados: number }>>(
    '/rh/aproveitamento/iniciar',
    { ano, mes },
  );
  return response.data.dados;
};
