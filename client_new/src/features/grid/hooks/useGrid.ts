// Path: features\grid\hooks\useGrid.ts
import { useQuery } from '@tanstack/react-query';
import { getStatisticsGrid } from '../../../services/gridService';
import { GridData } from '../types';

export const useGridStatistics = () => {
  return useQuery({
    queryKey: ['gridStatistics'],
    queryFn: getStatisticsGrid,
    select: (data) => {
      // Sort grids by data_inicio in descending order
      return data.dados.sort((a, b) => {
        const dateA = a.data_inicio ? new Date(a.data_inicio).getTime() : 0;
        const dateB = b.data_inicio ? new Date(b.data_inicio).getTime() : 0;
        return dateB - dateA;
      });
    }
  });
};