// Path: hooks\useAxios.ts
import { useCallback, useRef } from 'react';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { ApiError } from '../types/api';

interface UseAxiosOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface UseAxiosReturn {
  instance: AxiosInstance;
  callAxios: <T = any>(
    url: string, 
    method: string, 
    payload?: any, 
    config?: AxiosRequestConfig
  ) => Promise<{ data?: T; error?: ApiError }>;
  cancel: () => void;
}

export const useAxios = (options: UseAxiosOptions = {}): UseAxiosReturn => {
  const { logout } = useAuthStore();
  
  // Create Axios instance with default config
  const instance = useRef(axios.create({
    baseURL: options.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:3013',
    timeout: options.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })).current;
  
  // Create abort controller for cancelling requests
  const controllerRef = useRef(new AbortController());
  
  // Add authorization header to requests
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('@sap_web-Token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Handle response errors
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle 401 and 403 errors (unauthorized/forbidden)
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
      
      return Promise.reject(error);
    }
  );
  
  // Function to make API calls with error handling
  const callAxios = useCallback(async <T = any>(
    url: string, 
    method: string, 
    payload?: any,
    config?: AxiosRequestConfig
  ): Promise<{ data?: T; error?: ApiError }> => {
    try {
      const response: AxiosResponse<T> = await instance.request({
        signal: controllerRef.current.signal,
        method,
        url,
        data: payload,
        ...config,
      });
      
      return { data: response.data };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'An unexpected error occurred',
        status: error.response?.status
      };
      
      return { error: apiError };
    }
  }, [instance]);
  
  // Function to cancel pending requests
  const cancel = useCallback(() => {
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
  }, []);
  
  return {
    instance,
    callAxios,
    cancel
  };
};