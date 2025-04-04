// Path: hooks\usePIT.ts
import { useQuery } from '@tanstack/react-query';
import { getPIT } from '@/services/pitService';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { PitItem } from '@/types/pit';
import { ApiResponse } from '@/types/api';
import { useEffect, useRef, useCallback } from 'react';
import { createCancelToken } from '@/utils/apiErrorHandler';
import axios from 'axios';

// Define query keys
const QUERY_KEYS = {
  PIT_DATA: createQueryKey('pitData'),
};

// Define a type for the transformed PIT data
export interface PitViewModel {
  project: string;
  rows: Record<string, string | number>[];
}

// Month mapping - constants outside the component for better performance
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

export const usePITData = () => {
  // Token de cancelamento para requisição
  const cancelTokenRef = useRef(createCancelToken());

  // Limpeza quando componente desmontar
  useEffect(() => {
    return () => {
      cancelTokenRef.current.cancel('Component unmounted');
    };
  }, []);

  // Função de transformação memoizada
  const transformPitData = useCallback(
    (data: ApiResponse<PitItem[]>): PitViewModel[] => {
      // Transform data for table display
      const projectData: Record<
        string,
        Record<
          string,
          {
            months: number[];
            meta?: number;
          }
        >
      > = {};

      // Process API data
      data.dados.forEach(element => {
        if (!projectData[element.projeto]) {
          projectData[element.projeto] = {};
        }

        if (!projectData[element.projeto][element.lote]) {
          projectData[element.projeto][element.lote] = {
            months: Array(12).fill(0),
            meta: element.meta,
          };
        }

        // Month is 1-based index (1 = January)
        if (element.month >= 1 && element.month <= 12) {
          projectData[element.projeto][element.lote].months[element.month - 1] =
            element.finalizadas;
          // Store meta if provided
          if (element.meta !== undefined) {
            projectData[element.projeto][element.lote].meta = element.meta;
          }
        }
      });

      // Transform to final format
      const result: PitViewModel[] = Object.keys(projectData).map(
        projectKey => {
          return {
            project: projectKey,
            rows: Object.keys(projectData[projectKey]).map(lotKey => {
              const lotData = projectData[projectKey][lotKey];
              const meta = lotData.meta || 0;
              const count = lotData.months.reduce(
                (sum, value) => sum + +value,
                0,
              );
              const percent =
                meta === 0 ? '0.00%' : `${((count / meta) * 100).toFixed(2)}%`;

              const row: Record<string, string | number> = {
                lot: lotKey,
                meta: meta,
                count: count,
                percent: percent,
              };

              // Add months
              MONTHS.forEach((month, idx) => {
                row[month.id] = lotData.months[idx];
              });

              return row;
            }),
          };
        },
      );

      return result;
    },
    [],
  );

  // Query com nova API
  const query = useQuery<ApiResponse<PitItem[]>, unknown, PitViewModel[]>({
    queryKey: QUERY_KEYS.PIT_DATA,
    queryFn: () => getPIT(cancelTokenRef.current),
    staleTime: STALE_TIMES.FREQUENT_DATA,
    select: transformPitData,
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
