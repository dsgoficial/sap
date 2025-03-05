// Path: stores\mapStore.ts
import { create } from 'zustand';
import { MapLayer } from '@/types/map';

interface MapState {
  layers: MapLayer[];
  visibleLayers: Record<string, boolean>;

  setLayers: (layers: MapLayer[]) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setInitialVisibility: () => void;
  setLayerVisibility: (layerId: string, isVisible: boolean) => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  layers: [],
  visibleLayers: {},

  setLayers: layers => {
    set({ layers });

    const { visibleLayers } = get();
    const hasAnyVisibleLayers = Object.keys(visibleLayers).length > 0;

    if (!hasAnyVisibleLayers) {
      get().setInitialVisibility();
    }
  },

  toggleLayerVisibility: layerId => {
    set(state => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerId]: !state.visibleLayers[layerId],
      },
    }));
  },

  setLayerVisibility: (layerId, isVisible) => {
    set(state => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerId]: isVisible,
      },
    }));
  },

  setInitialVisibility: () => {
    const { layers } = get();

    set(state => {
      const initialVisibility: Record<string, boolean> = {
        ...state.visibleLayers,
      };

      layers.forEach(layer => {
        if (initialVisibility[layer.id] === undefined) {
          initialVisibility[layer.id] = true;
        }
      });

      return { visibleLayers: initialVisibility };
    });
  },
}));

export const selectLayers = (state: MapState) => state.layers;
export const selectVisibleLayers = (state: MapState) => state.visibleLayers;
