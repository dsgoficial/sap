// Path: stores\fieldActivitiesStore.ts
import { create } from 'zustand';

// Define state type
interface FieldActivitiesState {
  // Selected field and tab
  selectedCampoId: string | null;
  selectedCampoNome: string | null;
  selectedTab: 'fotos' | 'resumo';
  showSidebar: boolean;

  // Selected tracks for display on map
  selectedTracks: string[];
}

// Define actions type
interface FieldActivitiesActions {
  setSelectedCampo: (id: string | null, nome?: string | null) => void;
  setSelectedTab: (tab: 'fotos' | 'resumo') => void;
  setShowSidebar: (show: boolean) => void;
  toggleSelectedTrack: (trackId: string) => void;
  setSelectedTracks: (trackIds: string[]) => void;
}

// Create store with separated state and actions.
// SEM persistência: selectedTracks não deve vazar entre campos nem entre sessões
// (antes era persistido no localStorage e nunca limpo).
const useFieldActivitiesStoreBase = create<
  FieldActivitiesState & { actions: FieldActivitiesActions }
>()(set => ({
  // State
  selectedCampoId: null,
  selectedCampoNome: null,
  selectedTab: 'resumo',
  showSidebar: false,
  selectedTracks: [],

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
          // Limpa tracks ao trocar de campo (não arrastar tracks do campo anterior).
          selectedTracks: [],
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
            // Limpa tracks ao fechar a sidebar.
            selectedTracks: [],
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
  },
}));

// Custom hooks for selectors (atomic selectors)
export const useSelectedCampoId = () =>
  useFieldActivitiesStoreBase(state => state.selectedCampoId);

export const useSelectedTab = () =>
  useFieldActivitiesStoreBase(state => state.selectedTab);

export const useShowSidebar = () =>
  useFieldActivitiesStoreBase(state => state.showSidebar);

export const useSelectedTracks = () =>
  useFieldActivitiesStoreBase(state => state.selectedTracks);

export const useFieldActivitiesActions = () =>
  useFieldActivitiesStoreBase(state => state.actions);

// Selector usado com a store completa (ex.: CampoMap via useFieldActivitiesStore).
export const selectSelectedTracks = (state: FieldActivitiesState) =>
  state.selectedTracks;

// Maintain existing store export for backwards compatibility
export const useFieldActivitiesStore = useFieldActivitiesStoreBase;
