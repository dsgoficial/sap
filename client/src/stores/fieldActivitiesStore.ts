// Path: stores\fieldActivitiesStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define state type
interface FieldActivitiesState {
  // Selected field and tab
  selectedCampoId: string | null;
  selectedCampoNome: string | null;
  selectedTab: 'fotos' | 'resumo';
  showSidebar: boolean;

  // Selected tracks for display on map
  selectedTracks: string[];

  // GeoJSON data for map
  geoJsonData: GeoJSON.FeatureCollection<GeoJSON.Geometry, any> | null;
}

// Define actions type
interface FieldActivitiesActions {
  setSelectedCampo: (id: string | null, nome?: string | null) => void;
  setSelectedTab: (tab: 'fotos' | 'resumo') => void;
  setShowSidebar: (show: boolean) => void;
  toggleSelectedTrack: (trackId: string) => void;
  setSelectedTracks: (trackIds: string[]) => void;
  setGeoJsonData: (
    data: GeoJSON.FeatureCollection<GeoJSON.Geometry, any> | null,
  ) => void;
}

// Create store with separated state and actions
const useFieldActivitiesStoreBase = create<
  FieldActivitiesState & { actions: FieldActivitiesActions }
>()(
  persist(
    set => ({
      // State
      selectedCampoId: null,
      selectedCampoNome: null,
      selectedTab: 'resumo',
      showSidebar: false,
      selectedTracks: [],
      geoJsonData: null,

      // Actions
      actions: {
        setSelectedCampo: (id, nome = null) => {
          set(state => {
            // Return same state if no change to prevent unnecessary renders
            if (
              state.selectedCampoId === id &&
              state.selectedCampoNome === nome
            ) {
              return state;
            }
            return {
              selectedCampoId: id,
              selectedCampoNome: nome,
              showSidebar: !!id, // Open sidebar when campo is selected
            };
          });
        },

        setSelectedTab: tab => {
          set(state => {
            // Return same state if no change
            if (state.selectedTab === tab) {
              return state;
            }
            return { selectedTab: tab };
          });
        },

        setShowSidebar: show => {
          set(state => {
            // Return same state if no change
            if (state.showSidebar === show) {
              return state;
            }

            // Close sidebar logic
            if (!show) {
              return {
                showSidebar: false,
                selectedCampoId: null,
                selectedCampoNome: null,
              };
            }

            return { showSidebar: show };
          });
        },

        toggleSelectedTrack: trackId => {
          set(state => {
            const isSelected = state.selectedTracks.includes(trackId);
            // Use filter for removing and spread for adding to avoid mutating
            const newSelectedTracks = isSelected
              ? state.selectedTracks.filter(id => id !== trackId)
              : [...state.selectedTracks, trackId];

            return { selectedTracks: newSelectedTracks };
          });
        },

        setSelectedTracks: trackIds => {
          set(state => {
            // Compare array contents to avoid unnecessary updates
            if (
              state.selectedTracks.length === trackIds.length &&
              state.selectedTracks.every(id => trackIds.includes(id))
            ) {
              return state;
            }
            return { selectedTracks: trackIds };
          });
        },

        setGeoJsonData: data => {
          set(state => {
            // Skip update if same reference
            if (state.geoJsonData === data) {
              return state;
            }
            return { geoJsonData: data };
          });
        },
      },
    }),
    {
      name: 'field-activities-storage',
      // Only persist certain fields
      partialize: state => ({
        selectedTracks: state.selectedTracks,
        // Don't persist sidebar state, campo selection, or large GeoJSON data
      }),
      // Use a custom storage to handle JSON parsing/stringifying
      storage: createJSONStorage(() => localStorage),
      // Add an onRehydrate callback to ensure compatibility
      onRehydrateStorage: () => state => {
        console.log('Field activities state rehydrated:', state);
      },
    },
  ),
);

// Custom hooks for selectors (atomic selectors)
export const useSelectedCampoId = () =>
  useFieldActivitiesStoreBase(state => state.selectedCampoId);

export const useSelectedCampoNome = () =>
  useFieldActivitiesStoreBase(state => state.selectedCampoNome);

export const useSelectedTab = () =>
  useFieldActivitiesStoreBase(state => state.selectedTab);

export const useShowSidebar = () =>
  useFieldActivitiesStoreBase(state => state.showSidebar);

export const useSelectedTracks = () =>
  useFieldActivitiesStoreBase(state => state.selectedTracks);

export const useGeoJsonData = () =>
  useFieldActivitiesStoreBase(state => state.geoJsonData);

export const useFieldActivitiesActions = () =>
  useFieldActivitiesStoreBase(state => state.actions);

// Legacy selector functions to maintain API compatibility
export const selectSelectedCampoId = (state: FieldActivitiesState) =>
  state.selectedCampoId;
export const selectSelectedCampoNome = (state: FieldActivitiesState) =>
  state.selectedCampoNome;
export const selectSelectedTab = (state: FieldActivitiesState) =>
  state.selectedTab;
export const selectShowSidebar = (state: FieldActivitiesState) =>
  state.showSidebar;
export const selectSelectedTracks = (state: FieldActivitiesState) =>
  state.selectedTracks;
export const selectGeoJsonData = (state: FieldActivitiesState) =>
  state.geoJsonData;

// Maintain existing store export for backwards compatibility
export const useFieldActivitiesStore = useFieldActivitiesStoreBase;
