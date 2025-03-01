// Path: hooks\useAuth.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { LoginRequest } from '../types/auth';

export const useAuth = () => {
  const { user, isAuthenticated, isAdmin, setUser, logout, getRole } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      if (response.success) {
        setUser(response.dados);
        navigate('/');
        setError(null);
      } else {
        setError(response.message);
      }
    },
    onError: (error: Error) => {
      setError(error.message || 'Falha na autenticação');
    },
  });
  
  const login = (credentials: LoginRequest) => {
    loginMutation.mutate(credentials);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout: handleLogout,
    getRole,
    error,
    isLoading: loginMutation.isPending,
  };
};