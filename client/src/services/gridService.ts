// Path: services\gridService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { GridData } from '../types/grid';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';

/**
 * Get statistics grid data
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getStatisticsGrid = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<GridData[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<GridData[]>>(
      '/acompanhamento/grade_acompanhamento/',
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
      'Erro ao carregar dados da grade estatística',
      'getStatisticsGrid',
    );
  }
};
