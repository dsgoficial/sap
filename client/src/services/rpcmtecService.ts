// Path: services\rpcmtecService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';

// RPCMTec - seções de produção e pessoal que o SAP gera (preview + DOCX).

export interface EstadoPitProducao {
  lote: string;
  previsto: number;
  prontos_ano: number;
  prontos_mes: number;
  percentual: number | null;
}

export interface EstadoPitNaoProducao {
  numero_meta: number;
  item: string;
  descricao: string;
  previsto: number;
  realizado_ano: number;
  realizado_mes: number;
  percentual: number | null;
}

export interface ExecucaoLote {
  bloco: string;
  num_produtos: number;
  num_operadores: number;
  percentual: number | null;
}

export interface Entrega {
  tipo: string;
  escala: string;
  uuid: string;
  identificador: string;
  lote: string;
}

export interface AtividadeCampo {
  local: string;
  data: string;
  finalidade: string;
  efetivo: string | null;
}

export interface CapacitacaoMinistrada {
  capacitacao: string;
  periodo: string;
  instituicoes: string | null;
  efetivo_capacitado: number | null;
}

export interface ExtraPitLinha {
  demandante: string;
  tipo_produto: string;
  quantidade: number;
  situacao: string;
  data_entrega: string | null;
  documento_autorizacao: string | null;
  descricao: string | null;
}

export interface Aproveitamento {
  militar: string;
  atividades: string | null;
}

export interface CapacitacaoRecebida {
  plano_codigo: string | null;
  capacitacao: string;
  instituicao: string | null;
  militar: string | null;
}

export interface LinhaIndicador {
  indicador: string;
  mes: number | string;
  ano: number | string;
}

export interface RpcmtecSap {
  ano: number;
  mes: number;
  estadoPitProducao: EstadoPitProducao[];
  estadoPitNaoProducao: EstadoPitNaoProducao[];
  execucaoLote: ExecucaoLote[];
  entregas: Entrega[];
  campo: AtividadeCampo[];
  capacitacaoMinistrada: CapacitacaoMinistrada[];
  extraPit: ExtraPitLinha[];
  aproveitamento: Aproveitamento[];
  capacitacaoRecebida: CapacitacaoRecebida[];
  totalCapacitacao: LinhaIndicador[];
  totais: LinhaIndicador[];
}

// Preview em tela (JSON).
export const getRpcmtec = async (
  ano: number,
  mes: number,
): Promise<RpcmtecSap> => {
  const response = await apiClient.get<ApiResponse<RpcmtecSap>>(
    `/relatorio/rpcmtec/${ano}/${mes}`,
  );
  return response.data.dados;
};

// Download do DOCX (blob + trigger de download no navegador).
export const downloadRpcmtecDocx = async (
  ano: number,
  mes: number,
): Promise<void> => {
  const response = await apiClient.get(
    `/relatorio/rpcmtec/${ano}/${mes}/docx`,
    { responseType: 'blob' },
  );
  const blob = response.data as Blob;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RPCMTec-sap-${ano}-${String(mes).padStart(2, '0')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
