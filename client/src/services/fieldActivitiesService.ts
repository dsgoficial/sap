// Path: services\fieldActivitiesService.ts
import apiClient from '../lib/axios';
import {
  FotosResponse,
  TracksResponse,
  CamposGeoJSONApiResponse,
  Campo,
  Foto,
  Track,
} from '../types/fieldActivities';
import { ApiResponse } from '../types/api';

/**
 * Get a specific campo by ID
 */
export const getCampoById = async (
  campoId: string,
): Promise<ApiResponse<Campo>> => {
  try {
    const response = await apiClient.get<ApiResponse<Campo>>(
      `/campo/campos/${campoId}`,
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching campo with ID ${campoId}:`, error);
    throw error;
  }
};

/**
 * Get fotos by campo ID
 */
export const getFotosByCampo = async (
  campoId: string,
): Promise<ApiResponse<Foto[]>> => {
  if (!campoId) {
    return {
      dados: [],
      success: false,
      message: 'Campo ID is required',
    };
  }

  try {
    const response = await apiClient.get<FotosResponse>(
      `/campo/fotos/campos/${campoId}`,
    );
    return {
      dados: response.data.dados || [],
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error(`Error fetching fotos for campo ${campoId}:`, error);
    throw error;
  }
};

/**
 * Get tracks by campo ID
 */
export const getTracksByCampo = async (
  campoId: string,
): Promise<ApiResponse<Track[]>> => {
  if (!campoId) {
    return {
      dados: [],
      success: false,
      message: 'Campo ID is required',
    };
  }

  try {
    const response = await apiClient.get<TracksResponse>(
      `/campo/tracks/campos/${campoId}`,
    );
    return {
      dados: response.data.dados || [],
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error(`Error fetching tracks for campo ${campoId}:`, error);
    throw error;
  }
};

/**
 * Get GeoJSON for all campos
 */
export const getCamposGeoJSON = async (): Promise<
  ApiResponse<CamposGeoJSONApiResponse>
> => {
  try {
    const response = await apiClient.get<CamposGeoJSONApiResponse>(
      '/campo/campos-geojson',
    );
    return {
      dados: response.data,
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error fetching campos GeoJSON:', error);
    throw error;
  }
};
