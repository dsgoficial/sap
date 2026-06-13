// Path: services\authService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { LoginRequest, LoginResponse } from '../types/auth';
import { handleApiError, createCancelToken } from '@/utils/apiErrorHandler';
import axios from 'axios';

const APLICACAO = 'sap_web';

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

    // Validação de runtime do campo crítico: o token deve vir como string não
    // vazia. A expiração é derivada do claim `exp` do JWT no authStore (setUser),
    // não fabricada aqui.
    if (response.data.success) {
      const token = response.data.dados?.token;
      if (typeof token !== 'string' || token.length === 0) {
        throw handleApiError(
          new Error('Resposta de login inválida: token ausente'),
          'Resposta de login inválida',
          'login',
        );
      }
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
