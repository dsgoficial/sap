// Path: hooks\useMap.ts
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getViews, getLotGeoJSON } from '@/services/mapService';
import { useLayers, useVisibleLayers, useMapActions } from '@/stores/mapStore';
import { MapLayer } from '@/types/map';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { ApiResponse } from '@/types/api';
import axios, { CancelTokenSource } from 'axios';
import { createCancelToken } from '@/utils/apiErrorHandler';

const QUERY_KEYS = {
  MAP_VIEWS: createQueryKey('mapViews'),
  LOT_GEOJSON: (lotNames: string[]) =>
    createQueryKey('lotGeoJSON', lotNames.join(',')),
};

export const useMapData = () => {
  const layers = useLayers();
  const visibleLayers = useVisibleLayers();
  const { setLayers } = useMapActions();

  // Referências para tokens de cancelamento
  const viewsCancelTokenRef = useRef<CancelTokenSource | null>(null);
  const geoJSONCancelTokenRef = useRef<CancelTokenSource | null>(null);

  // Criar novos tokens de cancelamento quando o componente for montado
  useEffect(() => {
    viewsCancelTokenRef.current = createCancelToken();
    geoJSONCancelTokenRef.current = createCancelToken();

    // Cleanup - cancelar requisições pendentes quando o componente for desmontado
    return () => {
      if (viewsCancelTokenRef.current) {
        viewsCancelTokenRef.current.cancel('Component unmounted');
      }
      if (geoJSONCancelTokenRef.current) {
        geoJSONCancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Get available views
  const viewsQuery = useQuery<ApiResponse<any>, unknown, ApiResponse<any>>({
    queryKey: QUERY_KEYS.MAP_VIEWS,
    queryFn: () => getViews(viewsCancelTokenRef.current || undefined),
    retry: (failureCount, error) => {
      // Não tentar novamente se for um erro de cancelamento
      if (axios.isCancel(error)) return false;
      return failureCount < 2;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA, // Views don't change frequently
  });

  // Safely extract and filter lot views
  const lotViews = (() => {
    try {
      if (!viewsQuery.data?.dados?.views) return [];
      return viewsQuery.data.dados.views.filter(
        (view: any) => view && view.tipo === 'lote' && view.nome,
      );
    } catch (error) {
      console.error('Error extracting lot views:', error);
      return [];
    }
  })();

  // Get lotView names for query key
  const lotViewNames = lotViews.map((v: any) => v.nome);

  // Get GeoJSON data for each lot
  const geoJSONQuery = useQuery<any, unknown, MapLayer[]>({
    queryKey: QUERY_KEYS.LOT_GEOJSON(lotViewNames),
    queryFn: async () => {
      if (lotViews.length === 0) return [];

      // Use Promise.allSettled to handle individual failures gracefully
      const promises = lotViews.map((view: any) => {
        const cancelToken = geoJSONCancelTokenRef.current || undefined;
        return getLotGeoJSON(view.nome, cancelToken).catch(error => {
          if (axios.isCancel(error)) throw error; // Propagar erros de cancelamento

          console.error(`Error fetching GeoJSON for ${view.nome}:`, error);
          return { dados: [] }; // Return empty data on error
        });
      });

      const results = await Promise.allSettled(promises);

      // Transform results into MapLayer objects
      const newLayers: MapLayer[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          if (data?.dados?.length > 0 && data.dados[0]?.geojson) {
            newLayers.push({
              id: lotViews[index].nome,
              name: lotViews[index].lote,
              geojson: data.dados[0].geojson,
              visible: true,
            });
          }
        }
      });

      return newLayers;
    },
    enabled: lotViews.length > 0,
    retry: (failureCount, error) => {
      // Não tentar novamente se for um erro de cancelamento
      if (axios.isCancel(error)) return false;
      return failureCount < 1;
    },
    staleTime: STALE_TIMES.REFERENCE_DATA, // GeoJSON data doesn't change frequently
  });

  // Update the store when layers data is loaded, with race condition protection
  useEffect(() => {
    if (geoJSONQuery.data && geoJSONQuery.data.length > 0) {
      // Only update if the data has changed
      const currentLayerIds = layers
        .map(layer => layer.id)
        .sort()
        .join(',');
      const newLayerIds = geoJSONQuery.data
        .map(layer => layer.id)
        .sort()
        .join(',');

      if (currentLayerIds !== newLayerIds) {
        setLayers(geoJSONQuery.data);
      }
    }
  }, [geoJSONQuery.data, layers, setLayers]);

  return {
    layers,
    visibleLayers,
    isLoading: viewsQuery.isLoading || geoJSONQuery.isLoading,
    isError: viewsQuery.isError || geoJSONQuery.isError,
    error:
      viewsQuery.error || geoJSONQuery.error
        ? standardizeError(viewsQuery.error || geoJSONQuery.error)
        : null,
    isSuccess: viewsQuery.isSuccess && geoJSONQuery.isSuccess,
  };
};
