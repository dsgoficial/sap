// Path: services\activityMonitoringService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { RunningActivity, CompletedActivity } from '../types/microControl';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';

/**
 * Get activities currently in progress
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getRunningActivities = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<RunningActivity[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<RunningActivity[]>>(
      '/acompanhamento/atividades_em_execucao',
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    // Se a requisição foi cancelada, apenas propaga o erro
    if (axios.isCancel(error)) {
      throw error;
    }

    throw handleApiError(
      error,
      'Erro ao buscar atividades em execução',
      'getRunningActivities',
    );
  }
};

/**
 * Get most recently completed activities
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getLastCompletedActivities = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<CompletedActivity[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<CompletedActivity[]>>(
      '/acompanhamento/ultimas_atividades_finalizadas',
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    // Se a requisição foi cancelada, apenas propaga o erro
    if (axios.isCancel(error)) {
      throw error;
    }

    throw handleApiError(
      error,
      'Erro ao buscar atividades finalizadas recentemente',
      'getLastCompletedActivities',
    );
  }
};
