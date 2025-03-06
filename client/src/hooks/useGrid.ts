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

// Define query keys
const QUERY_KEYS = {
  GRID_STATISTICS: createQueryKey('gridStatistics'),
};

export const useGridStatistics = () => {
  // TData is the type returned AFTER select function transforms the data
  const query = useQuery<ApiResponse<GridData[]>, unknown, GridData[]>({
    queryKey: QUERY_KEYS.GRID_STATISTICS,
    queryFn: getStatisticsGrid,
    staleTime: STALE_TIMES.FREQUENT_DATA, // Grid data changes frequently
    select: data => {
      // Transform ApiResponse<GridData[]> to GridData[]
      return data.dados.sort((a, b) => {
        const dateA = a.data_inicio ? new Date(a.data_inicio).getTime() : 0;
        const dateB = b.data_inicio ? new Date(b.data_inicio).getTime() : 0;
        return dateB - dateA;
      });
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
