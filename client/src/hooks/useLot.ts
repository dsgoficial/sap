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

// Define query keys
const QUERY_KEYS = {
  LOT_DATA: createQueryKey('lotData'),
};

// Define the type for the transformed lot data
export interface LotViewModel {
  lot: string;
  rows: Record<string, string | number>[];
}

// Month mapping
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
  // Fixed the TData type to match what select returns
  const query = useQuery<
    ApiResponse<LotSubphaseData[]>,
    unknown,
    LotViewModel[]
  >({
    queryKey: QUERY_KEYS.LOT_DATA,
    queryFn: getLots,
    staleTime: STALE_TIMES.FREQUENT_DATA, // Lot data changes frequently
    select: data => {
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

      // Current month to determine which values to display
      const currentMonthIdx = new Date().getMonth();

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
    refetchOnWindowFocus: false,
    refetchInterval: 300000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? standardizeError(query.error) : null,
    refetch: query.refetch,
  };
};
