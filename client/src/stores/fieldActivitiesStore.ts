// Path: stores/fieldActivitiesStore.ts
import { create } from 'zustand';

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
  
  // Actions
  setSelectedCampo: (id: string | null, nome?: string | null) => void;
  setSelectedTab: (tab: 'fotos' | 'resumo') => void;
  setShowSidebar: (show: boolean) => void;
  
  toggleSelectedTrack: (trackId: string) => void;
  setSelectedTracks: (trackIds: string[]) => void;
  
  setGeoJsonData: (data: GeoJSON.FeatureCollection<GeoJSON.Geometry, any> | null) => void;
}

export const useFieldActivitiesStore = create<FieldActivitiesState>((set) => ({
  selectedCampoId: null,
  selectedCampoNome: null,
  selectedTab: 'fotos',
  showSidebar: false,
  
  selectedTracks: [],
  
  geoJsonData: null,
  
  setSelectedCampo: (id, nome = null) => 
    set((state) => ({ 
      ...state, 
      selectedCampoId: id,
      selectedCampoNome: nome,
      showSidebar: !!id // Open sidebar when campo is selected
    })),
    
  setSelectedTab: (tab) => 
    set((state) => ({ ...state, selectedTab: tab })),
    
  setShowSidebar: (show) => 
    set((state) => ({ 
      ...state, 
      showSidebar: show,
      // Limpar o campo selecionado quando o sidebar é fechado
      // mas manter os tracks selecionados
      selectedCampoId: show ? state.selectedCampoId : null,
      selectedCampoNome: show ? state.selectedCampoNome : null
    })),
  
  toggleSelectedTrack: (trackId) => 
    set((state) => {
      const isSelected = state.selectedTracks.includes(trackId);
      const newSelectedTracks = isSelected
        ? state.selectedTracks.filter(id => id !== trackId)
        : [...state.selectedTracks, trackId];
        
      return { ...state, selectedTracks: newSelectedTracks };
    }),
  
  setSelectedTracks: (trackIds) => 
    set((state) => ({ ...state, selectedTracks: trackIds })),
  
  setGeoJsonData: (data) => 
    set((state) => ({ ...state, geoJsonData: data })),
}));

// Selector functions for performance optimization
export const selectSelectedCampoId = (state: FieldActivitiesState) => state.selectedCampoId;
export const selectSelectedCampoNome = (state: FieldActivitiesState) => state.selectedCampoNome;
export const selectSelectedTab = (state: FieldActivitiesState) => state.selectedTab;
export const selectShowSidebar = (state: FieldActivitiesState) => state.showSidebar;
export const selectSelectedTracks = (state: FieldActivitiesState) => state.selectedTracks;
export const selectGeoJsonData = (state: FieldActivitiesState) => state.geoJsonData;