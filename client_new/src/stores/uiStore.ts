// Path: stores\uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserPreferences, saveUserPreferences } from '../utils/storage';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  
  // Sidebar actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  
  // Theme actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading actions
  setLoading: (key: string, isLoading: boolean) => void;
  setGlobalLoading: (isLoading: boolean) => void;
}

// Função auxiliar para criar ID único
const generateId = () => Math.random().toString(36).substring(2, 11);

// Obter preferências iniciais
const preferences = getUserPreferences();

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sidebarOpen: preferences.sidebarOpen,
      theme: preferences.theme,
      notifications: [],
      loading: {
        global: false,
      },
      
      // Ações da sidebar
      openSidebar: () => {
        set({ sidebarOpen: true });
        // Atualizar preferências
        const prefs = getUserPreferences();
        saveUserPreferences({ ...prefs, sidebarOpen: true });
      },
      
      closeSidebar: () => {
        set({ sidebarOpen: false });
        // Atualizar preferências
        const prefs = getUserPreferences();
        saveUserPreferences({ ...prefs, sidebarOpen: false });
      },
      
      toggleSidebar: () => {
        const newState = !get().sidebarOpen;
        set({ sidebarOpen: newState });
        // Atualizar preferências
        const prefs = getUserPreferences();
        saveUserPreferences({ ...prefs, sidebarOpen: newState });
      },
      
      // Ações de tema
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        // Atualizar preferências
        const prefs = getUserPreferences();
        saveUserPreferences({ ...prefs, theme: newTheme });
      },
      
      setTheme: (theme) => {
        set({ theme });
        // Atualizar preferências
        const prefs = getUserPreferences();
        saveUserPreferences({ ...prefs, theme });
      },
      
      // Ações de notificação
      addNotification: (notification) => {
        const id = generateId();
        const newNotification = {
          ...notification,
          id,
          timestamp: Date.now(),
        };
        
        set(state => ({
          notifications: [...state.notifications, newNotification],
        }));
        
        return id;
      },
      
      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(notification => notification.id !== id),
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },
      
      // Ações de loading
      setLoading: (key, isLoading) => {
        set(state => ({
          loading: {
            ...state.loading,
            [key]: isLoading,
          },
        }));
      },
      
      setGlobalLoading: (isLoading) => {
        set(state => ({
          loading: {
            ...state.loading,
            global: isLoading,
          },
        }));
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);