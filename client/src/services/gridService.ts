// Path: services\gridService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { GridData } from '../types/grid';
import { handleApiError } from '@/utils/apiErrorHandler';

/**
 * Get statistics grid data
 * @param signal AbortSignal (injetado pelo React Query) para cancelamento
 */
export const getStatisticsGrid = async (
  signal?: AbortSignal,
): Promise<ApiResponse<GridData[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<GridData[]>>(
      '/acompanhamento/grade_acompanhamento/',
      { signal },
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
