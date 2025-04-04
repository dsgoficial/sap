// Path: services\activityService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import {
  CurrentActivityResponse,
  ErrorReport,
  ErrorType,
} from '../types/activity';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';

/**
 * Busca a atividade atual do usuário
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getCurrentActivity = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<CurrentActivityResponse>> => {
  try {
    const response = await apiClient.get<ApiResponse<CurrentActivityResponse>>(
      '/api/distribuicao/verifica',
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    // Se a requisição foi cancelada, apenas propaga o erro
    if (axios.isCancel(error)) {
      throw error;
    }

    throw handleApiError(
      error,
      'Erro ao buscar atividade atual',
      'getCurrentActivity',
    );
  }
};

/**
 * Inicia uma nova atividade
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const startActivity = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/distribuicao/inicia',
      {},
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    // Caso especial: tratamento do erro 400 como sucesso com mensagem específica
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 400
    ) {
      return {
        success: true,
        message: 'Sem atividades disponíveis para iniciar',
        dados: null,
      };
    }

    throw handleApiError(error, 'Erro ao iniciar atividade', 'startActivity');
  }
};

/**
 * Finaliza uma atividade específica
 * @param activityId ID da atividade a ser finalizada
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const finishActivity = async (
  activityId: string,
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/distribuicao/finaliza',
      {
        atividade_id: activityId,
        sem_correcao: false,
      },
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(
      error,
      'Erro ao finalizar atividade',
      'finishActivity',
    );
  }
};

/**
 * Reporta um problema em uma atividade
 * @param errorData Dados do problema
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const reportError = async (
  errorData: ErrorReport,
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      '/api/distribuicao/problema_atividade',
      errorData,
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Erro ao reportar problema', 'reportError');
  }
};

/**
 * Busca os tipos de erro disponíveis
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const getErrorTypes = async (
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<ErrorType[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<ErrorType[]>>(
      '/api/distribuicao/tipo_problema',
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    throw handleApiError(
      error,
      'Erro ao buscar tipos de problema',
      'getErrorTypes',
    );
  }
};

/**
 * Hook utilitário para lidar com erros de atividade
 * Mantemos isso como hook por depender do hook useSnackbar, mas não é um service em si
 */
export const useActivityErrorHandler = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleActivityError = useCallback(
    (error: any, fallbackMessage: string) => {
      if (axios.isCancel(error)) {
        // Ignora erros de cancelamento
        return;
      }

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
