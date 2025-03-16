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

  // Optimize setLayers to avoid unnecessary state updates
  setLayers: layers => {
    // Compare new layers with existing ones to prevent unnecessary updates
    const currentLayers = get().layers;

    // Only update if layer ids have changed
    const shouldUpdate =
      layers.length !== currentLayers.length ||
      layers.some((layer, index) => currentLayers[index]?.id !== layer.id);

    if (shouldUpdate) {
      set({ layers });

      const { visibleLayers } = get();
      const hasAnyVisibleLayers = Object.keys(visibleLayers).length > 0;

      if (!hasAnyVisibleLayers) {
        get().setInitialVisibility();
      }
    }
  },

  // Optimize toggleLayerVisibility to avoid object spreading which creates a new object
  toggleLayerVisibility: layerId => {
    set(state => {
      // Create a shallow copy only when needed
      const newVisibleLayers = { ...state.visibleLayers };
      newVisibleLayers[layerId] = !newVisibleLayers[layerId];

      return { visibleLayers: newVisibleLayers };
    });
  },

  setLayerVisibility: (layerId, isVisible) => {
    set(state => {
      // Only update if the visibility actually changes
      if (state.visibleLayers[layerId] === isVisible) {
        return state; // Return the current state unchanged
      }

      // Create a shallow copy and update
      const newVisibleLayers = { ...state.visibleLayers };
      newVisibleLayers[layerId] = isVisible;

      return { visibleLayers: newVisibleLayers };
    });
  },

  setInitialVisibility: () => {
    const { layers } = get();

    set(state => {
      if (
        Object.keys(state.visibleLayers).length === layers.length &&
        layers.every(layer => state.visibleLayers[layer.id] === true)
      ) {
        return state; // No changes needed
      }

      const initialVisibility: Record<string, boolean> = {};

      layers.forEach(layer => {
        initialVisibility[layer.id] = true;
      });

      return { visibleLayers: initialVisibility };
    });
  },
}));

export const selectLayers = (state: MapState) => state.layers;
export const selectVisibleLayers = (state: MapState) => state.visibleLayers;
