// Path: hooks\useFieldActivities.ts
import { useQuery } from '@tanstack/react-query';
import {
  getCampoById,
  getFotosByCampo,
  getTracksByCampo,
  getCamposGeoJSON,
} from '../services/fieldActivitiesService';
import {
  useSelectedCampoId,
  useSelectedTracks,
  useFieldActivitiesActions,
} from '../stores/fieldActivitiesStore';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';

// Query keys
export const QUERY_KEYS = {
  CAMPOS: createQueryKey('campos'),
  CAMPO_BY_ID: (id: string) => createQueryKey('campo', id),
  FOTOS_BY_CAMPO: (id: string) => createQueryKey('fotos', id),
  TRACKS_BY_CAMPO: (id: string) => createQueryKey('tracks', id),
  CAMPOS_GEOJSON: createQueryKey('camposGeoJSON'),
  ESTATISTICAS: createQueryKey('campoEstatisticas'),
  PRODUTOS_CAMPO: (id: string) => createQueryKey('produtosCampo', id),
  PRODUTOS_LOTE: (id: number) => createQueryKey('produtosLote', id),
  LOTES: createQueryKey('lotes'),
};

// Main hook for field activities
export const useFieldActivities = () => {
  // Use the new atomic selector hooks
  const selectedCampoId = useSelectedCampoId();
  const selectedTracks = useSelectedTracks();
  const {
    setSelectedCampo,
    setSelectedTab,
    setShowSidebar,
    toggleSelectedTrack,
    setSelectedTracks,
  } = useFieldActivitiesActions();

  // Query for GeoJSON data. O React Query é a fonte única — não copiamos para o
  // store (o antigo geoJsonData do store não era lido por ninguém).
  const geoJsonQuery = useQuery({
    queryKey: QUERY_KEYS.CAMPOS_GEOJSON,
    queryFn: async () => {
      const response = await getCamposGeoJSON();
      // Garantir que o tipo é exatamente 'FeatureCollection'
      const geoJsonData = response.dados.dados;
      if (geoJsonData && typeof geoJsonData === 'object') {
        return {
          ...geoJsonData,
          type: 'FeatureCollection' as const,
        };
      }
      return null;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA, // GeoJSON data doesn't change frequently
  });

  // Handler functions
  const handleSelectCampo = (campoId: string) => {
    // Find campo name from GeoJSON data (properties pode ser null em GeoJSON)
    const feature = geoJsonQuery.data?.features.find(
      f => f.properties?.id === campoId,
    );
    const campoNome = feature?.properties?.nome || null;

    setSelectedCampo(campoId, campoNome);
  };

  const handleViewFotos = (campoId: string, campoNome: string) => {
    setSelectedCampo(campoId, campoNome);
    setSelectedTab('fotos');
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

  return {
    // Data
    geoJsonData: geoJsonQuery.data,
    selectedCampoId,
    selectedTracks,

    // Loading states
    isLoadingGeoJson: geoJsonQuery.isLoading,

    // Error states
    error: geoJsonQuery.error ? standardizeError(geoJsonQuery.error) : null,

    // Actions
    handleSelectCampo,
    handleViewFotos,
    handleCloseSidebar,
    toggleSelectedTrack,
    setSelectedTracks,
  };
};

// Hook for fetching a specific campo by ID
export const useCampoById = (campoId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPO_BY_ID(campoId),
    queryFn: async () => {
      const response = await getCampoById(campoId);
      return response.dados;
    },
    enabled: !!campoId, // Only run if campoId is provided
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};

// Hook for fetching fotos by campo
export const useFotosByCampo = (campoId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.FOTOS_BY_CAMPO(campoId),
    queryFn: async () => {
      const response = await getFotosByCampo(campoId);
      return response.dados;
    },
    enabled: !!campoId, // Only run if campoId is provided
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};

// Hook for fetching tracks by campo
export const useTracksByCampo = (campoId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TRACKS_BY_CAMPO(campoId),
    queryFn: async () => {
      const response = await getTracksByCampo(campoId);
      return response.dados;
    },
    enabled: !!campoId, // Only run if campoId is provided
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};
