// Path: hooks/useFieldActivities.ts
import { useQuery } from '@tanstack/react-query';
import {
  getCampos,
  getCampoById,
  getFotos,
  getFotosByCampo,
  getTracks,
  getTracksByCampo,
  getSituacoes,
  getCategorias,
  getCamposGeoJSON,
} from '../services/fieldActivitiesService';
import {
  useFieldActivitiesStore,
  selectSelectedCampoId,
  selectSelectedTracks,
} from '../stores/fieldActivitiesStore';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { useEffect } from 'react';

// Query keys
const QUERY_KEYS = {
  CAMPOS: createQueryKey('campos'),
  CAMPO_BY_ID: (id: string) => createQueryKey('campo', id),
  FOTOS: createQueryKey('fotos'),
  FOTOS_BY_CAMPO: (id: string) => createQueryKey('fotos', id),
  TRACKS: createQueryKey('tracks'),
  TRACKS_BY_CAMPO: (id: string) => createQueryKey('tracks', id),
  SITUACOES: createQueryKey('situacoes'),
  CATEGORIAS: createQueryKey('categorias'),
  CAMPOS_GEOJSON: createQueryKey('camposGeoJSON'),
};

// Main hook for field activities
export const useFieldActivities = () => {
  const selectedCampoId = useFieldActivitiesStore(selectSelectedCampoId);
  const selectedTracks = useFieldActivitiesStore(selectSelectedTracks);
  const {
    setGeoJsonData,
    setSelectedCampo,
    setSelectedTab,
    setShowSidebar,
    toggleSelectedTrack,
    setSelectedTracks,
  } = useFieldActivitiesStore();

  // Query for GeoJSON data
  const geoJsonQuery = useQuery({
    queryKey: QUERY_KEYS.CAMPOS_GEOJSON,
    queryFn: async () => {
      const response = await getCamposGeoJSON();
      // Garantir que o tipo é exatamente 'FeatureCollection'
      const geoJsonData = response.dados.dados;
      if (geoJsonData && typeof geoJsonData === 'object') {
        return {
          ...geoJsonData,
          type: 'FeatureCollection' as const
        };
      }
      return null;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA, // GeoJSON data doesn't change frequently
  });

  // Set GeoJSON data to store when loaded
  useEffect(() => {
    if (geoJsonQuery.data) {
      setGeoJsonData(geoJsonQuery.data);
    }
  }, [geoJsonQuery.data, setGeoJsonData]);

  // Handler functions
  const handleSelectCampo = (campoId: string) => {
    // Find campo name from GeoJSON data
    const feature = geoJsonQuery.data?.features.find(
      (f) => f.properties.id === campoId
    );
    const campoNome = feature?.properties.nome || null;
    
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

// Hook for fetching all campos
export const useCampos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPOS,
    queryFn: async () => {
      const response = await getCampos();
      return response.dados;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
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

// Hook for fetching all fotos
export const useFotos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.FOTOS,
    queryFn: async () => {
      const response = await getFotos();
      return response.dados;
    },
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

// Hook for fetching all tracks
export const useTracks = () => {
  return useQuery({
    queryKey: QUERY_KEYS.TRACKS,
    queryFn: async () => {
      const response = await getTracks();
      return response.dados;
    },
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

// Hook for fetching all situações
export const useSituacoes = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SITUACOES,
    queryFn: async () => {
      const response = await getSituacoes();
      return response.dados.dados;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};

// Hook for fetching all categorias
export const useCategorias = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIAS,
    queryFn: async () => {
      const response = await getCategorias();
      return response.dados.dados;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA,
  });
};