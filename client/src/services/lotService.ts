// Path: services\lotService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { LotSubphaseData } from '../types/lot';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';

/**
 * Get lot statistics
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getLots = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<LotSubphaseData[]>> => {
  try {
    const year = new Date().getFullYear();
    const response = await apiClient.get<ApiResponse<LotSubphaseData[]>>(
      `/api/acompanhamento/pit/subfase/${year}`,
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    // Se a requisição foi cancelada, apenas propaga o erro
    if (axios.isCancel(error)) {
      throw error;
    }

    throw handleApiError(error, 'Erro ao carregar dados de lotes', 'getLots');
  }
};
