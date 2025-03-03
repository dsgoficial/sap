// Path: hooks\useAuth.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { LoginRequest } from '../types/auth';
import { useSnackbar } from 'notistack';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isAdmin,
    login: storeLogin,
    logout: storeLogout,
    getRole,
  } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

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
    onError: (error: Error) => {
      setError(error.message || 'Falha na autenticação');
      enqueueSnackbar('Falha na autenticação', { variant: 'error' });
      return false;
    },
  });

  const login = useCallback(
    async (credentials: LoginRequest): Promise<boolean> => {
      try {
        const result = await loginMutation.mutateAsync(credentials);
        return !!result;
      } catch (error) {
        return false;
      }
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    storeLogout();
    navigate('/login', { replace: true });
    enqueueSnackbar('Logout realizado com sucesso', { variant: 'success' });
  }, [storeLogout, navigate, enqueueSnackbar]);

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    getRole,
    error,
    isLoading: loginMutation.isPending,
  };
};
