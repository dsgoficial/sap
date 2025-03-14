// Path: services\lotService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { LotSubphaseData } from '../types/lot';

/**
 * Get lot statistics
 */
export const getLots = async (): Promise<ApiResponse<LotSubphaseData[]>> => {
  try {
    const year = new Date().getFullYear();
    const response = await apiClient.get<ApiResponse<LotSubphaseData[]>>(
      `/api/acompanhamento/pit/subfase/${year}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching lots:', error);
    throw error;
  }
};
