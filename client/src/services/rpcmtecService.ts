// Path: services\rpcmtecService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';

// RPCMTec: as subseções que o SAP gera, na numeração do documento da Divisão
// (2.1 a 2.6, 3.3, 6.1 e 6.2). As demais são do SCA ou não têm dono em sistema
// nenhum -- ver o cabeçalho de server/src/relatorio/relatorio_ctrl.js.
//
// Toda célula chega do servidor JÁ EM TEXTO, com o separador de milhar e o '-'
// de "não houve" no lugar. Formatar de novo aqui faria a tela divergir do DOCX
// no arredondamento, e quem confere um contra o outro veria diferença onde não
// há.

// A célula "Meta" da 2.1 pode ser um objeto de mesclagem vertical (o DOCX a
// funde entre as linhas da mesma meta). Na tela não há mesclagem, e é
// `meta_texto` que se mostra.
export interface CelulaMesclada {
  texto: string;
  merge?: 'restart' | 'continue';
  span?: number;
}

export interface EstadoPitLinha {
  meta: string | CelulaMesclada;
  meta_texto: string;
  item: string;
  produto_servico: string;
  quantidade: string;
  prontos_mes: string;
  prontos_ano: string;
  previsao_termino: string;
}

export interface TotalLinha {
  tipo_produto: string;
  mes: string;
  ano: string;
}

export interface ExecucaoLote {
  lote: string;
  num_produtos: string;
  num_operadores: string;
  percentual: string;
}

export interface Entrega {
  tipo: string;
  escala: string;
  uuid: string;
  identificador: string;
  meta_pit: string;
  lote: string;
}

export interface AtividadeCampo {
  local: string;
  data: string;
  finalidade: string;
  efetivo: string;
}

export interface CapacitacaoMinistrada {
  capacitacao: string;
  periodo: string;
  instituicoes: string;
  efetivo_capacitado: string;
}

export interface TotalCapacitacao {
  rotulo: string;
  valor: string;
}

export interface ExtraPitLinha {
  demandante: string;
  tipo_produto: string;
  quantidade: string;
  situacao: string;
  documento_autorizacao: string;
  descricao: string;
}

export interface Aproveitamento {
  militar: string;
  atividades: string;
}

export interface CapacitacaoRecebida {
  plano_codigo: string;
  capacitacao: string;
  instituicao: string;
  militar: string;
}

export interface RpcmtecSap {
  ano: number;
  mes: number;
  estadoPit: EstadoPitLinha[];
  totais: TotalLinha[];
  execucaoLote: ExecucaoLote[];
  entregas: Entrega[];
  campo: AtividadeCampo[];
  capacitacaoMinistrada: CapacitacaoMinistrada[];
  capacitacaoMinistradaTotais: TotalCapacitacao[];
  extraPit: ExtraPitLinha[];
  aproveitamento: Aproveitamento[];
  capacitacaoRecebida: CapacitacaoRecebida[];
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
  a.download = `RPCMTec-SAP-${ano}-${String(mes).padStart(2, '0')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
