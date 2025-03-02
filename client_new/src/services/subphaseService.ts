// Path: services\subphaseService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { SubphaseData } from '../types/subphase';

/**
 * Get activity subphase data
 */
export const getActivitySubphase = async (): Promise<
  ApiResponse<SubphaseData[]>
> => {
  try {
    const response = await apiClient.get<ApiResponse<SubphaseData[]>>(
      '/api/acompanhamento/atividade_subfase',
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching activity subphase data:', error);
    throw error;
  }
};

/**
 * Get subphases situation data
 */
export const getSubphasesSituation = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/acompanhamento/situacao_subfase',
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching subphases situation data:', error);
    throw error;
  }
};

/**
 * Get user activities data
 */
export const getUserActivities = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get<ApiResponse<any>>(
      '/api/acompanhamento/atividade_usuario',
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user activities data:', error);
    throw error;
  }
};
