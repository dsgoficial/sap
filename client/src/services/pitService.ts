// Path: services\pitService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { PitItem } from '../types/pit'; // Using the correct type

/**
 * Get PIT (Plan of Integrated Tasks) data
 */
export const getPIT = async (): Promise<ApiResponse<PitItem[]>> => {
  try {
    const year = new Date().getFullYear();
    const response = await apiClient.get<ApiResponse<PitItem[]>>(
      `/api/acompanhamento/pit/${year}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching PIT data:', error);
    throw error;
  }
};
