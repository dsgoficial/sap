// Path: services\mapService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';

/**
 * Get map views
 */
export const getViews = async () => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/producao/views',
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching map views:', error);
    throw error;
  }
};

/**
 * Get GeoJSON data for a lot
 */
export const getLotGeoJSON = async (lotName: string) => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/producao/views/lote/${lotName}`,
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching GeoJSON for lot ${lotName}:`, error);
    throw error;
  }
};
