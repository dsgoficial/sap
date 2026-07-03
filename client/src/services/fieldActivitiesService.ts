// Path: services\fieldActivitiesService.ts
import apiClient from '../lib/axios';
import {
  FotosResponse,
  TracksResponse,
  CamposGeoJSONApiResponse,
  Campo,
  CampoInput,
  Situacao,
  Categoria,
  Foto,
  FotoInput,
  Track,
  ProdutoLote,
  ProdutoCampo,
  CampoProdutoAssociacao,
  AssociacaoInput,
  EstatisticasCampos,
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
 * Get all campos (rich list used by the management table — inclui orgao,
 * qtd_fotos, qtd_track e produtos_associados, que o GeoJSON não traz)
 */
export const getCampos = async (): Promise<ApiResponse<Campo[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Campo[]>>('/campo/campos');
    return {
      dados: response.data.dados || [],
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error fetching campos:', error);
    throw error;
  }
};

/**
 * Get all situações (reference list for the campo form)
 */
export const getSituacoes = async (): Promise<ApiResponse<Situacao[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Situacao[]>>(
      '/campo/situacao',
    );
    return {
      dados: response.data.dados || [],
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error fetching situações:', error);
    throw error;
  }
};

/**
 * Get all categorias (reference list for the campo form)
 */
export const getCategorias = async (): Promise<ApiResponse<Categoria[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Categoria[]>>(
      '/campo/categoria',
    );
    return {
      dados: response.data.dados || [],
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Error fetching categorias:', error);
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
 * Get the binary content (image/video) of a single mídia as a Blob.
 * O binário NÃO vem mais inline no JSON da lista (evita estourar a heap do
 * servidor com vídeos); é servido pela rota dedicada /fotos/:id/arquivo.
 */
export const getFotoArquivo = async (fotoId: string): Promise<Blob> => {
  const response = await apiClient.get(`/campo/fotos/${fotoId}/arquivo`, {
    responseType: 'blob',
  });
  return response.data as Blob;
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

/* -------------------------------------------------------------------------- */
/*                               Mutations: Campo                             */
/* -------------------------------------------------------------------------- */

/**
 * Create a new campo (geometry is drawn later in QGIS)
 */
export const criaCampo = async (
  campo: CampoInput,
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post<ApiResponse<unknown>>(
    '/campo/campos',
    { campo },
  );
  return response.data;
};

/**
 * Update an existing campo (does not touch geometry)
 */
export const atualizaCampo = async (
  campoId: string,
  campo: CampoInput,
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.put<ApiResponse<unknown>>(
    `/campo/campos/${campoId}`,
    { campo },
  );
  return response.data;
};

/**
 * Delete a campo (and its produto associations, handled server-side)
 */
export const deletaCampo = async (
  campoId: string,
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.delete<ApiResponse<unknown>>(
    `/campo/campos/${campoId}`,
  );
  return response.data;
};

/**
 * Get aggregated statistics for campos
 */
export const getEstatisticasCampos = async (): Promise<
  ApiResponse<EstatisticasCampos>
> => {
  const response = await apiClient.get<ApiResponse<EstatisticasCampos>>(
    '/campo/campos/estatisticas',
  );
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                       Produto <-> Campo associations                       */
/* -------------------------------------------------------------------------- */

/**
 * Get all products of a lote (for association picker)
 */
export const getProdutosByLote = async (
  loteId: number,
): Promise<ApiResponse<ProdutoLote[]>> => {
  const response = await apiClient.get<ApiResponse<ProdutoLote[]>>(
    `/campo/produtos/${loteId}`,
  );
  return response.data;
};

/**
 * Get all produto <-> campo associations in the system (used for the
 * campo x lote cross-reference analysis table)
 */
export const getProdutosCampoTodos = async (): Promise<
  ApiResponse<CampoProdutoAssociacao[]>
> => {
  const response = await apiClient.get<ApiResponse<CampoProdutoAssociacao[]>>(
    '/campo/produtos_campo',
  );
  return response.data;
};

/**
 * Get product associations of a campo
 */
export const getProdutosByCampoId = async (
  campoId: string,
): Promise<ApiResponse<ProdutoCampo[]>> => {
  const response = await apiClient.get<ApiResponse<ProdutoCampo[]>>(
    `/campo/produtos_campo/${campoId}`,
  );
  return response.data;
};

/**
 * Create product-campo associations
 */
export const criaProdutosCampo = async (
  associacoes: AssociacaoInput[],
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post<ApiResponse<unknown>>(
    '/campo/produtos_campo',
    { associacoes },
  );
  return response.data;
};

/**
 * Delete all product associations of a campo
 */
export const deletaProdutosByCampo = async (
  campoId: string,
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.delete<ApiResponse<unknown>>(
    `/campo/produtos_campo/${campoId}`,
  );
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                               Mutations: Foto                              */
/* -------------------------------------------------------------------------- */

/**
 * Create photos (base64 payload)
 */
export const criaFotos = async (
  fotos: FotoInput[],
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post<ApiResponse<unknown>>('/campo/fotos', {
    fotos,
  });
  return response.data;
};

/**
 * Update photo metadata (descricao / data_imagem)
 */
export const atualizaFoto = async (
  fotoId: string,
  foto: { descricao?: string | null; data_imagem?: string | null },
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.put<ApiResponse<unknown>>(
    `/campo/fotos/${fotoId}`,
    { foto },
  );
  return response.data;
};

/**
 * Delete a photo
 */
export const deletaFoto = async (
  fotoId: string,
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.delete<ApiResponse<unknown>>(
    `/campo/fotos/${fotoId}`,
  );
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                              Mutations: Track                              */
/* -------------------------------------------------------------------------- */

/**
 * Update track metadata
 */
export const atualizaTrack = async (
  trackId: string,
  track: Partial<Track>,
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.put<ApiResponse<unknown>>(
    `/campo/tracks/${trackId}`,
    { track },
  );
  return response.data;
};

/**
 * Delete a track (and its points, handled server-side)
 */
export const deletaTrack = async (
  trackId: string,
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.delete<ApiResponse<unknown>>(
    `/campo/tracks/${trackId}`,
  );
  return response.data;
};
