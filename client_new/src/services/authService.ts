// Path: services\authService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { LoginRequest, LoginResponse } from '../types/auth';

const APLICACAO = 'sap_web';

/**
 * Login user with username and password
 */
export const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/login', {
    usuario: credentials.usuario,
    senha: credentials.senha,
    aplicacao: APLICACAO,
    cliente: 'sap'
  });
  
  return response.data;
};

/**
 * Check if the current token is still valid
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    // This could be a lightweight endpoint that just checks token validity
    await apiClient.get('/api/validate-token');
    return true;
  } catch (error) {
    return false;
  }
};