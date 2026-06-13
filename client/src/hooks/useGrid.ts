// Path: hooks\useGrid.ts
import { useQuery } from '@tanstack/react-query';
import { getStatisticsGrid } from '@/services/gridService';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { GridData } from '@/types/grid';
import { ApiResponse } from '@/types/api';
import { useCallback } from 'react';
import axios from 'axios';

// Define query keys
const QUERY_KEYS = {
  GRID_STATISTICS: createQueryKey('gridStatistics'),
};

export const useGridStatistics = () => {
  // Função memoizada para transformar os dados
  const transformGridData = useCallback(
    (data: ApiResponse<GridData[]>): GridData[] => {
      // Cópia antes de ordenar para não mutar o array no cache do React Query.
      return [...data.dados].sort((a, b) => {
        const dateA = a.data_inicio ? new Date(a.data_inicio).getTime() : 0;
        const dateB = b.data_inicio ? new Date(b.data_inicio).getTime() : 0;
        return dateB - dateA;
      });
    },
    [],
  );

  // Query com tipagem adequada. O cancelamento é feito pelo AbortSignal que o
  // React Query injeta na queryFn (cobre unmount e refetch, inclusive StrictMode).
  const query = useQuery<ApiResponse<GridData[]>, unknown, GridData[]>({
    queryKey: QUERY_KEYS.GRID_STATISTICS,
    queryFn: ({ signal }) => getStatisticsGrid(signal),
    staleTime: STALE_TIMES.FREQUENT_DATA,
    select: transformGridData,
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
