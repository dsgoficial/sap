// Path: hooks\useAuth.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  useIsAuthenticated,
  useIsAdmin,
  useUser,
  useUsername,
  useAuthActions,
} from '../stores/authStore';
import { LoginRequest } from '../types/auth';
import { useSnackbar } from 'notistack';
import { standardizeError } from '@/lib/queryClient';

export const useAuth = () => {
  const user = useUser();
  const username = useUsername();
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const { login: storeLogin, logout: storeLogout, getRole } = useAuthActions();

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Define login mutation with React Query and improved error handling
  const loginMutation = useMutation({
    mutationFn: storeLogin,
    onSuccess: success => {
      if (success) {
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
      const standardizedError = standardizeError(error);
      setError(standardizedError.message || 'Falha na autenticação');
      enqueueSnackbar(standardizedError.message || 'Falha na autenticação', {
        variant: 'error',
      });
      return false;
    },
  });

  // Wrap login function with useCallback for memoization
  const login = useCallback(
    async (credentials: LoginRequest): Promise<boolean> => {
      try {
        const result = await loginMutation.mutateAsync(credentials);
        return !!result;
      } catch (error) {
        // Error is already handled in onError callback
        return false;
      }
    },
    [loginMutation],
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
    login,
    logout,
    getRole,
    error,
    isLoading: loginMutation.isPending,
  };
};
