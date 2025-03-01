// Path: features\map\hooks\useMap.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getViews, getLotGeoJSON } from '../../../services/mapService';
import { useMapStore } from '../store/mapStore';
import { MapLayer } from '../types';

export const useMapData = () => {
  const { setLayers, setInitialVisibility } = useMapStore();

  // Get available views
  const viewsQuery = useQuery({
    queryKey: ['mapViews'],
    queryFn: getViews
  });

  // Filter the views to get only lot type views
  const lotViews = viewsQuery.data?.dados.views.filter(view => view.tipo === 'lote') || [];

  // Get GeoJSON data for each lot
  const geoJSONQuery = useQuery({
    queryKey: ['lotGeoJSON', lotViews.map(v => v.nome)],
    queryFn: async () => {
      if (lotViews.length === 0) return [];
      
      const promises = lotViews.map(view => getLotGeoJSON(view.nome));
      const results = await Promise.all(promises);
      
      // Transform results into MapLayer objects
      const layers: MapLayer[] = [];
      
      results.forEach((result, index) => {
        if (result.dados?.length > 0 && result.dados[0].geojson) {
          layers.push({
            id: lotViews[index].nome,
            name: lotViews[index].nome,
            geojson: result.dados[0].geojson,
            visible: true
          });
        }
      });
      
      return layers;
    },
    enabled: lotViews.length > 0
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
    isSuccess: viewsQuery.isSuccess && geoJSONQuery.isSuccess
  };
};

// Helper functions for map style rules
export const getIsNullRule = (field: string) => {
  return ['any', ['==', ['get', field], null], ['==', ['get', field], ""]];
};

export const getIsNotNullRule = (field: string) => {
  return ['all', ['!=', ['get', field], null], ['!=', ['get', field], ""]];
};

export const getRuleColorByField = (field: string): string => {
  const colorMap: Record<string, string> = {
    'preparo': 'rgb(175,141,195)',
    'extracao': 'rgb(252,141,89)',
    'validacao': 'rgb(255,255,191)',
    'disseminacao': 'rgb(145,207,96)',
    'concluido': 'rgb(26,152,80)'
  };
  return colorMap[field] || '#607d8b';
};

export const getLegendItems = (): { label: string; color: string; border: boolean }[] => {
  return [
    { label: 'Preparo não iniciada', color: getRuleColorByField('preparo'), border: false },
    { label: 'Preparo em execução', color: getRuleColorByField('preparo'), border: true },
    { label: 'Extração não iniciada', color: getRuleColorByField('extracao'), border: false },
    { label: 'Extração em execução', color: getRuleColorByField('extracao'), border: true },
    { label: 'Validação não iniciada', color: getRuleColorByField('validacao'), border: false },
    { label: 'Validação em execução', color: getRuleColorByField('validacao'), border: true },
    { label: 'Disseminação não iniciada', color: getRuleColorByField('disseminacao'), border: false },
    { label: 'Disseminação em execução', color: getRuleColorByField('disseminacao'), border: true },
    { label: 'Concluído', color: getRuleColorByField('concluido'), border: false }
  ];
};