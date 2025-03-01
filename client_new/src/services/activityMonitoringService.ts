// Path: services\activityMonitoringService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { RunningActivity, CompletedActivity } from '../features/microControl/types';

/**
 * Get activities currently in progress
 */
export const getRunningActivities = async (): Promise<ApiResponse<RunningActivity[]>> => {
  const response = await apiClient.get<ApiResponse<RunningActivity[]>>(
    '/api/acompanhamento/atividades_em_execucao'
  );
  return response.data;
};

/**
 * Get most recently completed activities
 */
export const getLastCompletedActivities = async (): Promise<ApiResponse<CompletedActivity[]>> => {
  const response = await apiClient.get<ApiResponse<CompletedActivity[]>>(
    '/api/acompanhamento/ultimas_atividades_finalizadas'
  );
  return response.data;
};