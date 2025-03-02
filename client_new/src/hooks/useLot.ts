// Path: hooks\useLot.ts
import { useQuery } from '@tanstack/react-query';
import { getLots } from '@/services/lotService';

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
  return useQuery({
    queryKey: ['lotData'],
    queryFn: getLots,
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
      const result: any[] = Object.keys(tableData).map(lotKey => {
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
  });
};
