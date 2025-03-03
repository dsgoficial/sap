// Path: stores\mapStore.ts
import { create } from 'zustand';
import { MapLayer } from '@/types/map';

// Define the MapState interface
interface MapState {
  // State
  layers: MapLayer[];
  visibleLayers: Record<string, boolean>;

  // Actions
  setLayers: (layers: MapLayer[]) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setInitialVisibility: () => void;
  setLayerVisibility: (layerId: string, isVisible: boolean) => void;
}

// Create the MapStore with Zustand
export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  layers: [],
  visibleLayers: {},

  // Set all map layers
  setLayers: layers => {
    set({ layers });

    // Initialize visibility for new layers
    const { visibleLayers } = get();
    const hasAnyVisibleLayers = Object.keys(visibleLayers).length > 0;

    // Only auto-initialize if visibleLayers is empty
    if (!hasAnyVisibleLayers) {
      get().setInitialVisibility();
    }
  },

  // Toggle visibility for a single layer
  toggleLayerVisibility: layerId => {
    set(state => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerId]: !state.visibleLayers[layerId],
      },
    }));
  },

  // Set visibility for a single layer
  setLayerVisibility: (layerId, isVisible) => {
    set(state => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerId]: isVisible,
      },
    }));
  },

  // Initialize visibility for all layers (all visible by default)
  setInitialVisibility: () => {
    const { layers } = get();

    set(state => {
      const initialVisibility: Record<string, boolean> = {
        ...state.visibleLayers,
      };

      // Set any new layers to visible by default
      layers.forEach(layer => {
        // Only initialize layers that don't already have visibility set
        if (initialVisibility[layer.id] === undefined) {
          initialVisibility[layer.id] = true;
        }
      });

      return { visibleLayers: initialVisibility };
    });
  },
}));

// Selectors for performance optimization
export const selectLayers = (state: MapState) => state.layers;
export const selectVisibleLayers = (state: MapState) => state.visibleLayers;
