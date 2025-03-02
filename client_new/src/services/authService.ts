// Path: services\authService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { LoginRequest, LoginResponse } from '../types/auth';

const APLICACAO = 'sap_web';
const TOKEN_EXPIRY_KEY = '@sap_web-Token-Expiry';

/**
 * Login user with username and password
 */
export const login = async (
  credentials: LoginRequest,
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/login',
      {
        usuario: credentials.usuario,
        senha: credentials.senha,
        aplicacao: APLICACAO,
        cliente: 'sap',
      },
    );

    // If login is successful, store token expiry (assuming token valid for 24 hours)
    if (response.data.success && response.data.dados.token) {
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toISOString());
    }

    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};
