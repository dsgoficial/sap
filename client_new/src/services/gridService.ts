// Path: services\gridService.ts
import apiClient from '../lib/axios';
import { ApiResponse } from '../types/api';
import { GridData } from '../types/grid';

export const getStatisticsGrid = async (): Promise<ApiResponse<GridData[]>> => {
  const response = await apiClient.get<ApiResponse<GridData[]>>(
    '/api/acompanhamento/grade_acompanhamento/'
  );
  return response.data;
};