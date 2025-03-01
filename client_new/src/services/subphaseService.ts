// Path: services\subphaseService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { SubphaseData, SubphaseSituationItem, UserActivityData } from '../types/subphase';

export const getActivitySubphase = async (): Promise<ApiResponse<SubphaseData[]>> => {
  const response = await apiClient.get<ApiResponse<SubphaseData[]>>(
    '/api/acompanhamento/atividade_subfase'
  );
  return response.data;
};

export const getSubphasesSituation = async (): Promise<ApiResponse<SubphaseSituationItem[]>> => {
  const response = await apiClient.get<ApiResponse<SubphaseSituationItem[]>>(
    '/api/acompanhamento/situacao_subfase'
  );
  return response.data;
};

export const getUserActivities = async (): Promise<ApiResponse<UserActivityData[]>> => {
  const response = await apiClient.get<ApiResponse<UserActivityData[]>>(
    '/api/acompanhamento/atividade_usuario'
  );
  return response.data;
};