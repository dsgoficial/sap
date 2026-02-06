// Path: services\mapService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';

/**
 * Get map views
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getViews = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
) => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      '/gerencia/view_acompanhamento?em_andamento_projeto=true',
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
      'Erro ao carregar visualizações do mapa',
      'getViews',
    );
  }
};

/**
 * Get GeoJSON data for a lot
 * @param lotName Nome do lote
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getLotGeoJSON = async (
  lotName: string,
  cancelToken?: ReturnType<typeof createCancelToken>,
) => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      `/acompanhamento/mapa/${lotName}`,
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
      `Erro ao carregar GeoJSON para o lote ${lotName}`,
      `getLotGeoJSON:${lotName}`,
    );
  }
};
