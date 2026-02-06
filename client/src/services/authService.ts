// Path: services\authService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { LoginRequest, LoginResponse } from '../types/auth';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';
import axios from 'axios';

const APLICACAO = 'sap_web';
const TOKEN_EXPIRY_KEY = '@sap_web-Token-Expiry';

/**
 * Login user with username and password
 * @param credentials Credenciais de login
 * @param cancelToken Token para possível cancelamento da requisição
 */
export const login = async (
  credentials: LoginRequest,
  cancelToken?: ReturnType<typeof createCancelToken>,
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      // baseURL do apiClient já é "/api".
      '/login',
      {
        usuario: credentials.usuario,
        senha: credentials.senha,
        aplicacao: APLICACAO,
        cliente: 'sap',
      },
      cancelToken ? { cancelToken: cancelToken.token } : undefined,
    );

    // If login is successful, store token expiry (assuming token valid for 24 hours)
    if (response.data.success && response.data.dados.token) {
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 24);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toISOString());
    }

    return response.data;
  } catch (error) {
    // Se a requisição foi cancelada, apenas propaga o erro
    if (axios.isCancel(error)) {
      throw error;
    }

    throw handleApiError(error, 'Erro durante o login', 'login');
  }
};
