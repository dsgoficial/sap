// Path: services\pitService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PitItem } from '../types/pit';

/**
 * Get PIT data
 */
export const getPIT = async (): Promise<ApiResponse<PitItem[]>> => {
  const year = new Date().getFullYear();
  const response = await apiClient.get<ApiResponse<PitItem[]>>(
    `/api/acompanhamento/pit/${year}`
  );
  return response.data;
};