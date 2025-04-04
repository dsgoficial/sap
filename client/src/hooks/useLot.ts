// Path: hooks\useLot.ts
import { useQuery } from '@tanstack/react-query';
import { getLots } from '@/services/lotService';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { LotSubphaseData } from '@/types/lot';
import { ApiResponse } from '@/types/api';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { createCancelToken } from '@/utils/apiErrorHandler';
import axios from 'axios';

// Define query keys
const QUERY_KEYS = {
  LOT_DATA: createQueryKey('lotData'),
};

// Define the type for the transformed lot data
export interface LotViewModel {
  lot: string;
  rows: Record<string, string | number>[];
}

// Month mapping - memoizado para evitar recriação a cada render
const MONTHS = [
  { label: 'Jan', id: 'jan' },
  { label: 'Fev', id: 'fev' },
  { label: 'Mar', id: 'mar' },
  { label: 'Abr', id: 'abr' },
  { label: 'Mai', id: 'mai' },
  { label: 'Jun', id: 'jun' },
  { label: 'Jul', id: 'jul' },
  { label: 'Ago', id: 'ago' },
  { label: 'Set', id: 'set' },
  { label: 'Out', id: 'out' },
  { label: 'Nov', id: 'nov' },
  { label: 'Dez', id: 'dez' },
];

export const useLotData = () => {
  // Token de cancelamento para requisição
  const cancelTokenRef = useRef(createCancelToken());

  // Limpeza quando componente desmontar
  useEffect(() => {
    return () => {
      cancelTokenRef.current.cancel('Component unmounted');
    };
  }, []);

  // Memoize o mês atual para estabilidade
  const currentMonthIdx = useMemo(() => new Date().getMonth(), []);

  // Função de transformação memoizada
  const transformLotData = useCallback(
    (data: ApiResponse<LotSubphaseData[]>): LotViewModel[] => {
      // Transform data for table display
      const tableData: Record<string, Record<string, number[]>> = {};

      // Process API data
      data.dados.forEach(element => {
        if (!tableData[element.lote]) {
          tableData[element.lote] = {};
        }

        if (!tableData[element.lote][element.subfase]) {
          tableData[element.lote][element.subfase] = Array(12).fill(0);
        }

        // Month is 1-based index (1 = January)
        if (element.month >= 1 && element.month <= 12) {
          tableData[element.lote][element.subfase][element.month - 1] =
            element.count;
        }
      });

      // Transform to final format
      const result: LotViewModel[] = Object.keys(tableData).map(lotKey => {
        return {
          lot: lotKey,
          rows: Object.keys(tableData[lotKey]).map(subphaseKey => {
            const row: Record<string, string | number> = {
              subphase: subphaseKey,
            };

            // Add months
            MONTHS.forEach((month, idx) => {
              // Only show values for past months
              row[month.id] =
                idx > currentMonthIdx
                  ? '-'
                  : tableData[lotKey][subphaseKey][idx];
            });

            return row;
          }),
        };
      });

      return result;
    },
    [currentMonthIdx],
  );

  // Query com seletor para transformação
  const query = useQuery<
    ApiResponse<LotSubphaseData[]>,
    unknown,
    LotViewModel[]
  >({
    queryKey: QUERY_KEYS.LOT_DATA,
    queryFn: () => getLots(cancelTokenRef.current),
    staleTime: STALE_TIMES.FREQUENT_DATA,
    select: transformLotData,
    refetchOnWindowFocus: false,
    refetchInterval: 300000,
    retry: (failureCount, error) => {
      // Não tentar novamente requisições canceladas
      if (axios.isCancel(error)) return false;
      return failureCount < 2;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? standardizeError(query.error) : null,
    refetch: query.refetch,
  };
};
