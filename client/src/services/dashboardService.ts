// Path: services\dashboardService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import {
  DashboardQuantityItem,
  DashboardFinishedItem,
  DashboardRunningItem,
  PitItem,
} from '../types/dashboard';

/**
 * Get dashboard data (all APIs in one request)
 */
export const getDashboardData = async () => {
  try {
    const year = new Date().getFullYear();

    const [quantityResponse, finishedResponse, runningResponse, pitResponse] =
      await Promise.all([
        apiClient.get<ApiResponse<DashboardQuantityItem[]>>(
          `/api/acompanhamento/dashboard/quantidade/${year}`,
        ),
        apiClient.get<ApiResponse<DashboardFinishedItem[]>>(
          `/api/acompanhamento/dashboard/finalizadas/${year}`,
        ),
        apiClient.get<ApiResponse<DashboardRunningItem[]>>(
          `/api/acompanhamento/dashboard/execucao`,
        ),
        apiClient.get<ApiResponse<PitItem[]>>(
          `/api/acompanhamento/pit/${year}`,
        ),
      ]);

    return {
      quantityData: quantityResponse.data.dados || [],
      finishedData: finishedResponse.data.dados || [],
      runningData: runningResponse.data.dados || [],
      pitData: pitResponse.data.dados || [],
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
