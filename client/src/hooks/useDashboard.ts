// Path: hooks\useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../services/dashboardService';
import { DashboardData } from '../types/dashboard';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { useEffect, useRef } from 'react';
import { createCancelToken } from '@/utils/apiErrorHandler';
import axios from 'axios';

const QUERY_KEYS = {
  DASHBOARD_DATA: createQueryKey('dashboardData'),
};

/**
 * Hook personalizado para buscar e gerenciar dados do dashboard
 */
export const useDashboard = () => {
  // Criação e gerenciamento do token de cancelamento
  const cancelTokenRef = useRef(createCancelToken());

  // Limpeza quando componente desmontar
  useEffect(() => {
    return () => {
      cancelTokenRef.current.cancel('Component unmounted');
    };
  }, []);

  const query = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_DATA,
    queryFn: async () => {
      try {
        const rawData = await getDashboardData(cancelTokenRef.current);
        return transformDashboardData(rawData);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Dashboard data request cancelled');
        }
        throw error;
      }
    },
    staleTime: STALE_TIMES.FREQUENT_DATA,
    retry: (failureCount, error) => {
      // Não tentar novamente requisições canceladas
      if (axios.isCancel(error)) return false;
      return failureCount < 2;
    },
  });

  return {
    dashboardData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? standardizeError(query.error) : null,
    refetch: query.refetch,
  };
};

/**
 * Transforma os dados brutos da API em formato adequado para o dashboard
 * Memoizado para performance
 */
const transformDashboardData = (
  data: Awaited<ReturnType<typeof getDashboardData>>,
): DashboardData => {
  const { quantityData, finishedData, runningData, pitData } = data;

  const totalProducts = quantityData.reduce(
    (sum, item) => sum + Number(item.quantidade),
    0,
  );
  const completedProducts = finishedData.reduce(
    (sum, item) => sum + Number(item.finalizadas),
    0,
  );

  const runningProducts = runningData.reduce(
    (sum, item) => sum + Number(item.count),
    0,
  );

  const adjustedRunningProducts = Math.min(
    runningProducts,
    Math.max(0, totalProducts - completedProducts),
  );

  // Calculate percentage based on properly validated values
  const progressPercentage = totalProducts
    ? (completedProducts / totalProducts) * 100
    : 0;

  const lotProgressData = quantityData.map(item => {
    const completed = Number(
      finishedData.find(f => f.lote === item.lote)?.finalizadas || 0,
    );

    const running = Math.min(
      Number(runningData.find(r => r.lote === item.lote)?.count || 0),
      Math.max(0, Number(item.quantidade) - completed),
    );

    const notStarted = Math.max(
      0,
      Number(item.quantidade) - (completed + running),
    );

    return {
      name: item.lote,
      completed,
      running,
      notStarted,
    };
  });

  // Format monthly data
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  // Explicitly type the array elements to satisfy the interface requirement
  const monthlyData: { [key: string]: any; month: string }[] = months.map(
    (monthName, idx) => {
      const monthNumber = idx + 1;
      // Create an object with the required 'month' property
      const dataForMonth: { [key: string]: any; month: string } = {
        month: monthName,
      };

      pitData.forEach(item => {
        if (item.month === monthNumber) {
          const lotKey = `lot_${item.lote}`;
          dataForMonth[lotKey] =
            Number(dataForMonth[lotKey] || 0) + Number(item.finalizadas);
        }
      });

      return dataForMonth;
    },
  );

  return {
    summary: {
      totalProducts,
      completedProducts,
      runningProducts: adjustedRunningProducts,
      progressPercentage,
    },
    lotProgressData,
    monthlyData,
  };
};
