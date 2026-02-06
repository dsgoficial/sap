// Path: lib\axios.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '../types/api';
import { logoutAndRedirect } from '../stores/authStore';

// Token storage key
const TOKEN_KEY = '@sap_web-Token';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  // Sempre use caminho relativo para evitar "localhost" no navegador do cliente.
  // DEV: o Vite proxy encaminha /api para o backend.
  // PROD: o servidor que entrega o frontend deve encaminhar /api para o backend.
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  response => response,
  (error: unknown) => {
    // Se for um erro de cancelamento, apenas propaga
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Cast para AxiosError para trabalhar com a tipagem correta
    const axiosError = error as AxiosError;

    // Handle 401 and 403 errors (unauthorized/forbidden)
    if (
      axiosError.response?.status === 401 ||
      axiosError.response?.status === 403
    ) {
      // Use the centralized logout and redirect function
      logoutAndRedirect();
    }

    // Criar um erro padronizado
    const apiError: ApiError = {
      message: axiosError.message || 'Ocorreu um erro inesperado',
      status: axiosError.response?.status,
      data: axiosError.response?.data,
    };

    return Promise.reject(apiError);
  },
);

export default apiClient;
