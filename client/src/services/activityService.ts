// Path: services\activityService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import {
  CurrentActivityResponse,
  ErrorReport,
  ErrorType,
} from '../types/activity';
import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

interface ActivityService {
  getCurrentActivity: () => Promise<ApiResponse<CurrentActivityResponse>>;
  startActivity: () => Promise<ApiResponse<any>>;
  finishActivity: (activityId: string) => Promise<ApiResponse<any>>;
  reportError: (errorData: ErrorReport) => Promise<ApiResponse<any>>;
  getErrorTypes: () => Promise<ApiResponse<ErrorType[]>>;
}

const createActivityService = (): ActivityService => {
  return {
    getCurrentActivity: async () => {
      try {
        const response = await apiClient.get<
          ApiResponse<CurrentActivityResponse>
        >('/api/distribuicao/verifica');
        return response.data;
      } catch (error) {
        console.error('Error fetching current activity:', error);
        throw error;
      }
    },

    startActivity: async () => {
      try {
        const response = await apiClient.post<ApiResponse<any>>(
          '/api/distribuicao/inicia',
          {},
        );
        return response.data;
      } catch (error: any) {
        console.error('Error starting activity:', error);
        // Special case: treat 400 error as a success with a specific message
        if (error.status === 400) {
          return {
            success: true,
            message: 'Sem atividades disponíveis para iniciar',
            dados: null,
          };
        }
        throw error;
      }
    },

    finishActivity: async (activityId: string) => {
      try {
        const response = await apiClient.post<ApiResponse<any>>(
          '/api/distribuicao/finaliza',
          {
            atividade_id: activityId,
            sem_correcao: false,
          },
        );
        return response.data;
      } catch (error) {
        console.error('Error finishing activity:', error);
        throw error;
      }
    },

    reportError: async (errorData: ErrorReport) => {
      try {
        const response = await apiClient.post<ApiResponse<any>>(
          '/api/distribuicao/problema_atividade',
          errorData,
        );
        return response.data;
      } catch (error) {
        console.error('Error reporting problem:', error);
        throw error;
      }
    },

    getErrorTypes: async () => {
      try {
        const response = await apiClient.get<ApiResponse<ErrorType[]>>(
          '/api/distribuicao/tipo_problema',
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching error types:', error);
        throw error;
      }
    },
  };
};

export const useActivityService = () => {
  return createActivityService();
};

export const useActivityErrorHandler = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleActivityError = useCallback(
    (error: any, fallbackMessage: string) => {
      if (error && error.message) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar(fallbackMessage, { variant: 'error' });
      }
    },
    [enqueueSnackbar],
  );

  return { handleActivityError };
};
