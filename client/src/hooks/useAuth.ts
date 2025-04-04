// Path: hooks\useAuth.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  useIsAuthenticated,
  useIsAdmin,
  useUser,
  useUsername,
  useAuthActions,
} from '../stores/authStore';
import { LoginRequest, LoginResponse } from '../types/auth';
import { useSnackbar } from 'notistack';
import { standardizeError } from '@/lib/queryClient';
import { login } from '@/services/authService';
import { createCancelToken } from '@/utils/apiErrorHandler';
import { ApiResponse } from '@/types/api';
import axios, { CancelTokenSource } from 'axios';

export const useAuth = () => {
  const user = useUser();
  const username = useUsername();
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const { setUser, logout: storeLogout, getRole } = useAuthActions();

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Referência para token de cancelamento
  const cancelTokenRef = useRef<CancelTokenSource>(createCancelToken());

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      cancelTokenRef.current.cancel('Component unmounted');
    };
  }, []);

  // Define login mutation com React Query e tratamento de erro melhorado
  const loginMutation = useMutation<
    ApiResponse<LoginResponse>,
    unknown,
    LoginRequest,
    unknown
  >({
    mutationFn: (credentials: LoginRequest) => {
      return login(credentials, cancelTokenRef.current);
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        // Agora usamos setUser em vez de storeLogin
        // LoginResponse e seu nome de usuário são passados para setUser
        const loginData = response.dados;
        setUser({
          ...loginData,
          // Adicionamos o nome de usuário das credenciais
          username: variables.usuario,
        });

        setError(null);
        enqueueSnackbar('Login realizado com sucesso!', { variant: 'success' });
        return true;
      } else {
        setError('Usuário ou senha inválidos');
        enqueueSnackbar('Usuário ou senha inválidos!', { variant: 'error' });
        return false;
      }
    },
    onError: (error: unknown) => {
      // Ignora erros de cancelamento
      if (axios.isCancel(error)) {
        console.log('Login request cancelled');
        return false;
      }

      const standardizedError = standardizeError(error);
      setError(standardizedError.message || 'Falha na autenticação');
      enqueueSnackbar(standardizedError.message || 'Falha na autenticação', {
        variant: 'error',
      });
      return false;
    },
  });

  // Wrap login function with useCallback for memoization
  const handleLogin = useCallback(
    async (credentials: LoginRequest): Promise<boolean> => {
      try {
        // Cancela qualquer requisição pendente
        cancelTokenRef.current.cancel('New login request initiated');
        // Cria um novo token de cancelamento
        cancelTokenRef.current = createCancelToken();

        const result = await loginMutation.mutateAsync(credentials);
        return !!result.success;
      } catch (error) {
        // Ignora erros de cancelamento
        if (axios.isCancel(error)) {
          console.log('Login request cancelled');
          return false;
        }

        // Erro já tratado no callback onError
        return false;
      }
    },
    [loginMutation, enqueueSnackbar],
  );

  // Wrap logout function with useCallback for memoization
  const logout = useCallback(() => {
    storeLogout();
    navigate('/login', { replace: true });
    enqueueSnackbar('Logout realizado com sucesso', { variant: 'success' });
  }, [storeLogout, navigate, enqueueSnackbar]);

  return {
    user,
    username,
    isAuthenticated,
    isAdmin,
    login: handleLogin,
    logout,
    getRole,
    error,
    isLoading: loginMutation.isPending,
  };
};
