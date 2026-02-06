// Path: services\subphaseService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { SubphaseData } from '../types/subphase';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';

/**
 * Get activity subphase data
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getActivitySubphase = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<SubphaseData[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<SubphaseData[]>>(
      '/acompanhamento/atividade_subfase',
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
      'Erro ao buscar dados de atividade por subfase',
      'getActivitySubphase',
    );
  }
};

/**
 * Get subphases situation data
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getSubphasesSituation = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      '/acompanhamento/situacao_subfase',
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
      'Erro ao buscar dados de situação de subfase',
      'getSubphasesSituation',
    );
  }
};

/**
 * Get user activities data
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getUserActivities = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      '/acompanhamento/atividade_usuario',
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
      'Erro ao buscar atividades de usuário',
      'getUserActivities',
    );
  }
};
