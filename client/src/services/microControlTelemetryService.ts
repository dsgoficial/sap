// Path: services\microControlTelemetryService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import {
  FeicaoResumo,
  MicroControlTelemetryFilters,
  TelaCobertura,
  TelaCoberturaFilters,
  TelaAproveitamento,
} from '../types/microControlTelemetry';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';

/**
 * Monta os query params, descartando valores nulos/vazios.
 */
const buildParams = (
  filters?: Record<string, unknown>,
): Record<string, string | number> => {
  const params: Record<string, string | number> = {};
  if (!filters) return params;
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params[key] = value as string | number;
    }
  });
  return params;
};

/**
 * GET generico do modulo: aplica params/cancelToken, propaga cancelamento e
 * encapsula o handleApiError. As funcoes abaixo so descrevem url/params/mensagem.
 */
const requestJson = async <T>(
  url: string,
  errorMessage: string,
  context: string,
  options: {
    params?: Record<string, string | number>;
    cancelToken?: ReturnType<typeof createCancelToken>;
  } = {},
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.get<ApiResponse<T>>(url, {
      ...(options.params ? { params: options.params } : {}),
      ...(options.cancelToken ? { cancelToken: options.cancelToken.token } : {}),
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }
    throw handleApiError(error, errorMessage, context);
  }
};

/**
 * Item da lista de lotes usado para popular o seletor de filtro.
 */
export interface LoteOption {
  id: number;
  nome: string;
}

/**
 * Lista de lotes cadastrados (GET /projeto/lote, admin-only). Usada apenas para
 * popular o seletor de filtro de lote.
 * @param cancelToken Token para possivel cancelamento da requisicao
 */
export const getLotesList = (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<LoteOption[]>> =>
  requestJson<LoteOption[]>(
    '/projeto/lote',
    'Erro ao buscar a lista de lotes',
    'getLotesList',
    { cancelToken },
  );

/**
 * Resumo de producao de feicao (por operador, por camada e serie diaria).
 * Datas opcionais (default no backend: ultimos 30 dias); lote_id opcional.
 * @param filters Filtros de lote e intervalo de datas
 * @param cancelToken Token para possivel cancelamento da requisicao
 */
export const getFeicaoResumo = (
  filters?: MicroControlTelemetryFilters,
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<FeicaoResumo>> =>
  requestJson<FeicaoResumo>(
    '/microcontrole/feicao/resumo',
    'Erro ao buscar o resumo de feição',
    'getFeicaoResumo',
    { params: buildParams(filters as Record<string, unknown> | undefined), cancelToken },
  );

/**
 * Cobertura de tela (envelopes amostrados do canvas) em GeoJSON.
 * @param filters Filtros de lote, operador e intervalo de datas
 * @param cancelToken Token para possivel cancelamento da requisicao
 */
export const getTelaCobertura = (
  filters?: TelaCoberturaFilters,
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<TelaCobertura>> =>
  requestJson<TelaCobertura>(
    '/microcontrole/tela/cobertura',
    'Erro ao buscar a cobertura de tela',
    'getTelaCobertura',
    { params: buildParams(filters as Record<string, unknown> | undefined), cancelToken },
  );

/**
 * Aproveitamento de tela de um operador (serie diaria de aproveitamento_pct).
 * Usa o mesmo intervalo de datas das demais consultas (default ult. 30 dias no
 * backend). Nao envia lote_id (a rota nao o aceita).
 * @param usuarioId Operador (obrigatorio)
 * @param filters Intervalo de datas da pagina
 * @param cancelToken Token para possivel cancelamento da requisicao
 */
export const getTelaAproveitamento = (
  usuarioId: number,
  filters?: MicroControlTelemetryFilters,
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<TelaAproveitamento[]>> =>
  requestJson<TelaAproveitamento[]>(
    '/microcontrole/tela/aproveitamento',
    'Erro ao buscar o aproveitamento de tela',
    'getTelaAproveitamento',
    {
      params: buildParams({
        usuario_id: usuarioId,
        data_inicio: filters?.data_inicio,
        data_fim: filters?.data_fim,
      }),
      cancelToken,
    },
  );
