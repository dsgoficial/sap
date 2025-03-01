// Path: services\mapService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { ViewsResponse, GeoJSONData } from '../types/map';

/**
 * Get available map views
 */
export const getViews = async (): Promise<ApiResponse<ViewsResponse>> => {
  const response = await apiClient.get<ApiResponse<ViewsResponse>>(
    '/api/gerencia/view_acompanhamento?em_andamento=true'
  );
  return response.data;
};

/**
 * Get GeoJSON data for a specific lot
 */
export const getLotGeoJSON = async (lot: string): Promise<ApiResponse<GeoJSONData[]>> => {
  const response = await apiClient.get<ApiResponse<GeoJSONData[]>>(
    `/api/acompanhamento/mapa/${lot}`
  );
  return response.data;
};