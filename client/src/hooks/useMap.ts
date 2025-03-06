// Path: hooks\useMap.ts
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getViews, getLotGeoJSON } from '@/services/mapService';
import {
  useMapStore,
  selectLayers,
  selectVisibleLayers,
} from '@/stores/mapStore';
import { MapLayer } from '@/types/map';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { ApiResponse } from '@/types/api';

const QUERY_KEYS = {
  MAP_VIEWS: createQueryKey('mapViews'),
  LOT_GEOJSON: (lotNames: string[]) =>
    createQueryKey('lotGeoJSON', lotNames.join(',')),
};

export const useMapData = () => {
  const layers = useMapStore(selectLayers);
  const visibleLayers = useMapStore(selectVisibleLayers);

  const { setLayers } = useMapStore();

  // Get available views
  const viewsQuery = useQuery<ApiResponse<any>, unknown, ApiResponse<any>>({
    queryKey: QUERY_KEYS.MAP_VIEWS,
    queryFn: getViews,
    retry: 2,
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
      const promises = lotViews.map((view: any) =>
        getLotGeoJSON(view.nome).catch(error => {
          console.error(`Error fetching GeoJSON for ${view.nome}:`, error);
          return { dados: [] }; // Return empty data on error
        }),
      );

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
    retry: 1,
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
