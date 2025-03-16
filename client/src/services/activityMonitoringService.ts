// Path: services\activityMonitoringService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { RunningActivity, CompletedActivity } from '../types/microControl';

/**
 * Get activities currently in progress
 */
export const getRunningActivities = async (): Promise<
  ApiResponse<RunningActivity[]>
> => {
  try {
    const response = await apiClient.get<ApiResponse<RunningActivity[]>>(
      '/api/acompanhamento/atividades_em_execucao',
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching running activities:', error);
    throw error;
  }
};

/**
 * Get most recently completed activities
 */
export const getLastCompletedActivities = async (): Promise<
  ApiResponse<CompletedActivity[]>
> => {
  try {
    const response = await apiClient.get<ApiResponse<CompletedActivity[]>>(
      '/api/acompanhamento/ultimas_atividades_finalizadas',
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching completed activities:', error);
    throw error;
  }
};
