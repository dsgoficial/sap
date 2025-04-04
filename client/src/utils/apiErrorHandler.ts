// Path: utils\apiErrorHandler.ts
import axios, { AxiosError, CancelTokenSource } from 'axios';
import { ApiError } from '@/types/api';
import { logoutAndRedirect } from '@/stores/authStore';

/**
 * Centraliza o tratamento de erros de API
 * @param error Erro capturado do try/catch
 * @param defaultMessage Mensagem padrão caso o erro não tenha uma mensagem
 * @param logLabel Identificador para o log de erro (opcional)
 * @returns Um objeto ApiError padronizado
 */
export const handleApiError = (
  error: unknown,
  defaultMessage: string,
  logLabel?: string,
): ApiError => {
  // Se for um erro do Axios
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // Verificar se é um erro de cancelamento - não é tratado como erro real
    if (axios.isCancel(error)) {
      return {
        message: 'Requisição cancelada',
        status: 499, // Código não-padrão para "Client Closed Request"
        isCancelled: true,
      };
    }

    // Verificar autenticação
    if (
      axiosError.response?.status === 401 ||
      axiosError.response?.status === 403
    ) {
      // Use a função centralizada para logout e redirecionamento
      logoutAndRedirect();
    }

    // Tentar extrair mensagem de erro da resposta
    let errorMessage = defaultMessage;
    if (
      axiosError.response?.data &&
      typeof axiosError.response.data === 'object'
    ) {
      const data = axiosError.response.data;
      if ('message' in data && typeof data.message === 'string') {
        errorMessage = data.message;
      }
    } else if (axiosError.message && axiosError.message !== 'Network Error') {
      errorMessage = axiosError.message;
    }

    const apiError: ApiError = {
      message: errorMessage,
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    };

    // Log do erro
    if (logLabel) {
      console.error(`API Error [${logLabel}]:`, apiError);
    } else {
      console.error('API Error:', apiError);
    }

    return apiError;
  }

  // Se for um ApiError, apenas retorná-lo
  if (error && typeof error === 'object' && 'message' in error) {
    return error as ApiError;
  }

  // Para outros tipos de erro
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  const apiError: ApiError = {
    message: errorMessage,
    status: undefined,
  };

  if (logLabel) {
    console.error(`Error [${logLabel}]:`, error);
  } else {
    console.error('Error:', error);
  }

  return apiError;
};

/**
 * Cria um token de cancelamento para requisições Axios
 * Usado para cancelar requisições quando componentes são desmontados
 */
export const createCancelToken = (): CancelTokenSource => {
  return axios.CancelToken.source();
};

/**
 * Verifica se um erro é um erro de cancelamento
 */
export const isRequestCancelled = (error: unknown): boolean => {
  return axios.isCancel(error);
};
