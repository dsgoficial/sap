// Path: hooks\useErrorHandler.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';

interface ErrorOptions {
  showSnackbar?: boolean;
  redirectOnAuthError?: boolean;
  logToConsole?: boolean;
}

export const useErrorHandler = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { logout } = useAuthStore();
  const { addNotification } = useUIStore();
  
  /**
   * Trata um erro genérico
   */
  const handleError = useCallback((
    error: unknown, 
    customMessage?: string,
    options: ErrorOptions = {
      showSnackbar: true,
      redirectOnAuthError: true,
      logToConsole: true
    }
  ) => {
    // Valores padrão
    const { 
      showSnackbar = true, 
      redirectOnAuthError = true,
      logToConsole = true
    } = options;
    
    // Mensagem de erro para exibição
    let errorMessage = customMessage || 'Ocorreu um erro inesperado';
    
    // Status de erro para tratamento específico
    let errorStatus = 0;
    
    // Identificar tipo de erro
    if (error instanceof AxiosError) {
      // Erro de API com Axios
      errorStatus = error.response?.status || 0;
      
      // Usar mensagem do erro se disponível
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Log detalhado no console
      if (logToConsole) {
        console.error('API Error:', {
          status: errorStatus,
          message: errorMessage,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data
        });
      }
    } else if (error instanceof Error) {
      // Erro JavaScript padrão
      errorMessage = error.message;
      
      if (logToConsole) {
        console.error('Error:', error);
      }
    } else if (error && typeof error === 'object') {
      // Outro objeto de erro
      errorMessage = String(error);
      
      if (logToConsole) {
        console.error('Unknown error object:', error);
      }
    }
    
    // Adicionar notificação ao estado global
    addNotification({
      message: errorMessage,
      type: 'error'
    });
    
    // Mostrar snackbar
    if (showSnackbar) {
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
    
    // Tratamento de erros de autenticação
    if (redirectOnAuthError && (errorStatus === 401 || errorStatus === 403)) {
      logout();
      navigate('/login', { state: { from: window.location.pathname } });
    }
    
    // Retornamos o erro tratado para uso eventual
    return {
      message: errorMessage,
      status: errorStatus,
      raw: error
    };
  }, [addNotification, enqueueSnackbar, logout, navigate]);
  
  /**
   * Tratamento específico para erros de API
   */
  const handleApiError = useCallback((
    error: unknown,
    customMessage = 'Erro na requisição',
    options?: ErrorOptions
  ) => {
    return handleError(error, customMessage, options);
  }, [handleError]);
  
  /**
   * Tratamento específico para erros de validação
   */
  const handleValidationError = useCallback((
    error: unknown,
    customMessage = 'Erro de validação',
    options?: ErrorOptions
  ) => {
    return handleError(error, customMessage, {
      ...options,
      redirectOnAuthError: false
    });
  }, [handleError]);
  
  return {
    handleError,
    handleApiError,
    handleValidationError
  };
};