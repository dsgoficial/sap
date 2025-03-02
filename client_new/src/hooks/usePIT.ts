// Path: hooks\usePIT.ts
import { useQuery } from '@tanstack/react-query';
import { getPIT } from '@/services/pitService';

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

export const usePITData = () => {
  return useQuery({
    queryKey: ['pitData'],
    queryFn: getPIT,
    select: data => {
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
      const result: any[] = Object.keys(projectData).map(projectKey => {
        return {
          project: projectKey,
          rows: Object.keys(projectData[projectKey]).map(lotKey => {
            const lotData = projectData[projectKey][lotKey];
            const meta = lotData.meta || 0;
            const count = lotData.months.reduce((sum, value) => sum + value, 0);
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
      });

      return result;
    },
  });
};
