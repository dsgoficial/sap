// Path: services\dashboardService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import {
  DashboardQuantityItem,
  DashboardFinishedItem,
  DashboardRunningItem,
  PitItem,
} from '../types/dashboard';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';

/**
 * Get dashboard data (all APIs in one request)
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getDashboardData = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
) => {
  try {
    const year = new Date().getFullYear();
    const config = cancelToken ? { cancelToken: cancelToken.token } : undefined;

    const [quantityResponse, finishedResponse, runningResponse, pitResponse] =
      await Promise.all([
        apiClient.get<ApiResponse<DashboardQuantityItem[]>>(
          `/api/acompanhamento/dashboard/quantidade/${year}`,
          config,
        ),
        apiClient.get<ApiResponse<DashboardFinishedItem[]>>(
          `/api/acompanhamento/dashboard/finalizadas/${year}`,
          config,
        ),
        apiClient.get<ApiResponse<DashboardRunningItem[]>>(
          `/api/acompanhamento/dashboard/execucao`,
          config,
        ),
        apiClient.get<ApiResponse<PitItem[]>>(
          `/api/acompanhamento/pit/${year}`,
          config,
        ),
      ]);

    return {
      quantityData: quantityResponse.data.dados || [],
      finishedData: finishedResponse.data.dados || [],
      runningData: runningResponse.data.dados || [],
      pitData: pitResponse.data.dados || [],
    };
  } catch (error) {
    // Se a requisição foi cancelada, apenas propaga o erro
    if (axios.isCancel(error)) {
      throw error;
    }

    throw handleApiError(
      error,
      'Erro ao carregar dados do dashboard',
      'getDashboardData',
    );
  }
};
