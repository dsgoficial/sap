// Path: hooks\useMicroControlTelemetry.ts
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios, { CancelTokenSource } from 'axios';
import {
  getFeicaoResumo,
  getTelaCobertura,
  getTelaAproveitamento,
  getLotesList,
  LoteOption,
} from '@/services/microControlTelemetryService';
import {
  FeicaoResumo,
  MicroControlTelemetryFilters,
  TelaCobertura,
  TelaCoberturaFilters,
  TelaAproveitamento,
} from '@/types/microControlTelemetry';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { ApiResponse } from '@/types/api';
import { createCancelToken } from '@/utils/apiErrorHandler';

// Chaves de query (incluem os filtros para invalidar ao trocar de filtro).
const QUERY_KEYS = {
  LOTES: createQueryKey('microControlTelemetryLotes'),
  FEICAO_RESUMO: (filters: MicroControlTelemetryFilters) =>
    createQueryKey(
      'microControlFeicaoResumo',
      JSON.stringify(filters ?? {}),
    ),
  TELA_COBERTURA: (filters: TelaCoberturaFilters) =>
    createQueryKey('microControlTelaCobertura', JSON.stringify(filters ?? {})),
  TELA_APROVEITAMENTO: (
    usuarioId: number | null,
    filters?: MicroControlTelemetryFilters,
  ) =>
    createQueryKey(
      'microControlTelaAproveitamento',
      `${usuarioId}-${JSON.stringify(filters ?? {})}`,
    ),
};

// Cria/limpa um token de cancelamento por ciclo de vida do hook.
const useCancelToken = () => {
  const ref = useRef<CancelTokenSource | null>(null);
  useEffect(() => {
    ref.current = createCancelToken();
    return () => {
      if (ref.current) {
        ref.current.cancel('Component unmounted');
      }
    };
  }, []);
  return ref;
};

// Nao tentar novamente em erro de cancelamento.
const retryNonCancel = (max: number) => (failureCount: number, error: unknown) => {
  if (axios.isCancel(error)) return false;
  return failureCount < max;
};

/**
 * Lista de lotes para o seletor de filtro.
 */
export const useLotesOptions = () => {
  const cancelTokenRef = useCancelToken();

  const query = useQuery<ApiResponse<LoteOption[]>, unknown, LoteOption[]>({
    queryKey: QUERY_KEYS.LOTES,
    queryFn: () => getLotesList(cancelTokenRef.current || undefined),
    staleTime: STALE_TIMES.REFERENCE_DATA,
    select: data => data.dados,
    retry: retryNonCancel(2),
  });

  return {
    lotes: query.data || [],
    isLoading: query.isLoading,
    error: query.error ? standardizeError(query.error) : null,
  };
};

/**
 * Resumo de feicao (por operador, por camada e serie diaria).
 */
export const useFeicaoResumo = (filters: MicroControlTelemetryFilters) => {
  const cancelTokenRef = useCancelToken();

  const query = useQuery<ApiResponse<FeicaoResumo>, unknown, FeicaoResumo>({
    queryKey: QUERY_KEYS.FEICAO_RESUMO(filters),
    queryFn: () =>
      getFeicaoResumo(filters, cancelTokenRef.current || undefined),
    staleTime: STALE_TIMES.FREQUENT_DATA,
    select: data => data.dados,
    retry: retryNonCancel(3),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? standardizeError(query.error) : null,
    refetch: query.refetch,
  };
};

/**
 * Cobertura de tela em GeoJSON (envelopes amostrados do canvas).
 */
export const useTelaCobertura = (
  filters: TelaCoberturaFilters,
  enabled = true,
) => {
  const cancelTokenRef = useCancelToken();

  const query = useQuery<ApiResponse<TelaCobertura>, unknown, TelaCobertura>({
    queryKey: QUERY_KEYS.TELA_COBERTURA(filters),
    queryFn: () =>
      getTelaCobertura(filters, cancelTokenRef.current || undefined),
    enabled,
    staleTime: STALE_TIMES.FREQUENT_DATA,
    select: data => data.dados,
    retry: retryNonCancel(3),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? standardizeError(query.error) : null,
    refetch: query.refetch,
  };
};

/**
 * Aproveitamento de tela de um operador (serie diaria). So roda com usuario_id.
 */
export const useTelaAproveitamento = (
  usuarioId: number | null,
  filters?: MicroControlTelemetryFilters,
) => {
  const cancelTokenRef = useCancelToken();

  const query = useQuery<
    ApiResponse<TelaAproveitamento[]>,
    unknown,
    TelaAproveitamento[]
  >({
    queryKey: QUERY_KEYS.TELA_APROVEITAMENTO(usuarioId, filters),
    queryFn: () =>
      getTelaAproveitamento(
        usuarioId as number,
        filters,
        cancelTokenRef.current || undefined,
      ),
    enabled: usuarioId !== null,
    staleTime: STALE_TIMES.FREQUENT_DATA,
    select: data => data.dados,
    retry: retryNonCancel(3),
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? standardizeError(query.error) : null,
  };
};
