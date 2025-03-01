// Path: features\lot\services\lotService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { LotSubphaseData } from '../types/lot';

export const getLots = async (): Promise<ApiResponse<LotSubphaseData[]>> => {
  const year = new Date().getFullYear();
  const response = await apiClient.get<ApiResponse<LotSubphaseData[]>>(
    `/api/acompanhamento/pit/subfase/${year}`
  );
  return response.data;
};