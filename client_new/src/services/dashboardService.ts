// Path: services\dashboardService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { 
  DashboardQuantityItem, 
  DashboardFinishedItem, 
  DashboardRunningItem,
  PitItem
} from '../types/dashboard';

/**
 * Get dashboard data (all APIs in one request)
 */
export const getDashboardData = async () => {
  const year = new Date().getFullYear();
  
  const [quantityResponse, finishedResponse, runningResponse, pitResponse] = await Promise.all([
    apiClient.get<ApiResponse<DashboardQuantityItem[]>>(
      `/api/acompanhamento/dashboard/quantidade/${year}`
    ),
    apiClient.get<ApiResponse<DashboardFinishedItem[]>>(
      `/api/acompanhamento/dashboard/finalizadas/${year}`
    ),
    apiClient.get<ApiResponse<DashboardRunningItem[]>>(
      `/api/acompanhamento/dashboard/execucao`
    ),
    apiClient.get<ApiResponse<PitItem[]>>(
      `/api/acompanhamento/pit/${year}`
    )
  ]);
  
  return {
    quantityData: quantityResponse.data.dados || [],
    finishedData: finishedResponse.data.dados || [],
    runningData: runningResponse.data.dados || [],
    pitData: pitResponse.data.dados || []
  };
};

/**
 * Get dashboard grid statistics
 */
export const getStatisticsGrid = async () => {
  const response = await apiClient.get<ApiResponse<any>>(
    '/api/acompanhamento/grade_acompanhamento/'
  );
  return response.data;
};

/**
 * Get activities currently in progress
 */
export const getRunningActivities = async () => {
  const response = await apiClient.get<ApiResponse<any>>(
    '/api/acompanhamento/atividades_em_execucao'
  );
  return response.data;
};

/**
 * Get most recently completed activities
 */
export const getLastCompletedActivities = async () => {
  const response = await apiClient.get<ApiResponse<any>>(
    '/api/acompanhamento/ultimas_atividades_finalizadas'
  );
  return response.data;
};