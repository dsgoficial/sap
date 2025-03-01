// Path: services\activityService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { Activity, CurrentActivityResponse, ErrorReport, ErrorType } from '../types/activity';

/**
 * Get the current activity
 */
export const getCurrentActivity = async (): Promise<ApiResponse<CurrentActivityResponse>> => {
  const response = await apiClient.get<ApiResponse<CurrentActivityResponse>>(
    '/api/distribuicao/verifica'
  );
  return response.data;
};

/**
 * Start a new activity
 */
export const startActivity = async (): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    '/api/distribuicao/inicia',
    {}
  );
  return response.data;
};

/**
 * Finish an activity
 */
export const finishActivity = async (activityId: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    '/api/distribuicao/finaliza',
    {
      'atividade_id': activityId,
      'sem_correcao': false,
    }
  );
  return response.data;
};

/**
 * Report an error for an activity
 */
export const reportError = async (errorData: ErrorReport): Promise<ApiResponse<any>> => {
  const response = await apiClient.post<ApiResponse<any>>(
    '/api/distribuicao/problema_atividade',
    errorData
  );
  return response.data;
};

/**
 * Get error types
 */
export const getErrorTypes = async (): Promise<ApiResponse<ErrorType[]>> => {
  const response = await apiClient.get<ApiResponse<ErrorType[]>>(
    '/api/distribuicao/tipo_problema'
  );
  return response.data;
};