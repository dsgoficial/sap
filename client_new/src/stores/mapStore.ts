// Path: stores\mapStore.ts
import { create } from 'zustand';
import { MapLayer } from '@/types/map';

interface MapState {
  layers: MapLayer[];
  visibleLayers: Record<string, boolean>;
  setLayers: (layers: MapLayer[]) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setInitialVisibility: () => void;
}

export const useMapStore = create<MapState>(set => ({
  layers: [],
  visibleLayers: {},

  setLayers: layers =>
    set({
      layers,
      // Don't automatically set visibility here to avoid race conditions
    }),

  toggleLayerVisibility: layerId =>
    set(state => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerId]: !state.visibleLayers[layerId],
      },
    })),

  setInitialVisibility: () =>
    set(state => {
      const initialVisibility: Record<string, boolean> = {};
      state.layers.forEach(layer => {
        initialVisibility[layer.id] = true;
      });
      return { visibleLayers: initialVisibility };
    }),
}));
