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

// Define query keys
const QUERY_KEYS = {
  MAP_VIEWS: createQueryKey('mapViews'),
  LOT_GEOJSON: (lotNames: string[]) =>
    createQueryKey('lotGeoJSON', lotNames.join(',')),
};

export const useMapData = () => {
  // Use selectors for better performance
  const layers = useMapStore(selectLayers);
  const visibleLayers = useMapStore(selectVisibleLayers);

  // Get actions from the store - removed unused setInitialVisibility
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
              name: lotViews[index].nome,
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

// Keep this function as it's used by MapVisualization
export const getLegendItems = (): {
  label: string;
  color: string;
  border: boolean;
}[] => {
  return [
    {
      label: 'Preparo não iniciada',
      color: 'rgb(175,141,195)', // preparo
      border: false,
    },
    {
      label: 'Preparo em execução',
      color: 'rgb(175,141,195)', // preparo
      border: true,
    },
    {
      label: 'Extração não iniciada',
      color: 'rgb(252,141,89)', // extracao
      border: false,
    },
    {
      label: 'Extração em execução',
      color: 'rgb(252,141,89)', // extracao
      border: true,
    },
    {
      label: 'Validação não iniciada',
      color: 'rgb(255,255,191)', // validacao
      border: false,
    },
    {
      label: 'Validação em execução',
      color: 'rgb(255,255,191)', // validacao
      border: true,
    },
    {
      label: 'Disseminação não iniciada',
      color: 'rgb(145,207,96)', // disseminacao
      border: false,
    },
    {
      label: 'Disseminação em execução',
      color: 'rgb(145,207,96)', // disseminacao
      border: true,
    },
    {
      label: 'Concluído',
      color: 'rgb(26,152,80)', // concluido
      border: false,
    },
  ];
};
