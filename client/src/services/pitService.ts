// Path: services\pitService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PitItem } from '../types/pit'; // Using the correct type
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';

/**
 * Get PIT (Plan of Integrated Tasks) data
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getPIT = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<PitItem[]>> => {
  try {
    const year = new Date().getFullYear();
    const response = await apiClient.get<ApiResponse<PitItem[]>>(
      `/acompanhamento/pit/${year}`,
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    // Se a requisição foi cancelada, apenas propaga o erro
    if (axios.isCancel(error)) {
      throw error;
    }

    throw handleApiError(error, 'Erro ao carregar dados do PIT', 'getPIT');
  }
};
