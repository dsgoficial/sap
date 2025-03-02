// Path: services\gridService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { GridData } from '../types/grid';

/**
 * Get statistics grid data
 */
export const getStatisticsGrid = async (): Promise<ApiResponse<GridData[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<GridData[]>>(
      '/api/acompanhamento/grade_acompanhamento/',
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics grid:', error);
    throw error;
  }
};
