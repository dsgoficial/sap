// Path: services\activityService.ts
import axios from 'axios';
import apiClient from '../lib/axios';
import { ApiResponse, ApiError } from '../types/api';
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
      '/distribuicao/verifica',
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
): Promise<ApiResponse<unknown>> => {
  try {
    const response = await apiClient.post<ApiResponse<unknown>>(
      '/distribuicao/inicia',
      {},
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error;
    }

    // O backend responde HTTP 400 com `success: true` e `dados: null` quando
    // NÃO há atividades disponíveis (caso de negócio normal). Erros de negócio
    // reais (ex.: "usuário já possui atividade em andamento") vêm com
    // `success: false` — esses NÃO devem ser silenciados como sucesso.
    const apiError = error as ApiError;
    const body = apiError?.data as
      | { success?: boolean; message?: string }
      | undefined;

    if (apiError?.status === 400 && body?.success === true) {
      return {
        success: true,
        message: body.message || 'Sem atividades disponíveis para iniciar',
        dados: null,
      };
    }

    // Demais casos: erro real — preserva a mensagem do backend, se houver.
    if (body?.message) {
      throw { ...apiError, message: body.message } as ApiError;
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
): Promise<ApiResponse<unknown>> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      '/distribuicao/finaliza',
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
): Promise<ApiResponse<unknown>> => {
  try {
    const response = await apiClient.post<ApiResponse<any>>(
      '/distribuicao/problema_atividade',
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
      '/distribuicao/tipo_problema',
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
