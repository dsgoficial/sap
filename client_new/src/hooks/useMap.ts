// Path: hooks\useMap.ts
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getViews, getLotGeoJSON } from '@/services/mapService';
import { useMapStore } from '@/stores/mapStore';
import { MapLayer } from '@/types/map';

export const useMapData = () => {
  const { setLayers, setInitialVisibility } = useMapStore();

  // Get available views
  const viewsQuery = useQuery({
    queryKey: ['mapViews'],
    queryFn: getViews,
  });

  // Filter the views to get only lot type views
  const lotViews =
    viewsQuery.data?.dados.views.filter((view: any) => view.tipo === 'lote') ||
    [];

  // Get GeoJSON data for each lot
  const geoJSONQuery = useQuery({
    queryKey: ['lotGeoJSON', lotViews.map((v: any) => v.nome)],
    queryFn: async () => {
      if (lotViews.length === 0) return [];

      const promises = lotViews.map((view: any) => getLotGeoJSON(view.nome));
      const results = await Promise.all(promises);

      // Transform results into MapLayer objects
      const layers: MapLayer[] = [];

      results.forEach((result, index) => {
        if (result.dados?.length > 0 && result.dados[0].geojson) {
          layers.push({
            id: lotViews[index].nome,
            name: lotViews[index].nome,
            geojson: result.dados[0].geojson,
            visible: true,
          });
        }
      });

      return layers;
    },
    enabled: lotViews.length > 0,
  });

  // Update the store when layers data is loaded
  useEffect(() => {
    if (geoJSONQuery.data) {
      setLayers(geoJSONQuery.data);
      setInitialVisibility();
    }
  }, [geoJSONQuery.data, setLayers, setInitialVisibility]);

  return {
    isLoading: viewsQuery.isLoading || geoJSONQuery.isLoading,
    isError: viewsQuery.isError || geoJSONQuery.isError,
    error: viewsQuery.error || geoJSONQuery.error,
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
