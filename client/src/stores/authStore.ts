// Path: stores\authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole, LoginResponse, LoginRequest } from '../types/auth';
import { login as loginApi } from '../services/authService';
import { navigateToLogin } from '../routes';

// Storage keys for localStorage
const STORAGE_KEYS = {
  TOKEN: '@sap_web-Token',
  USER_AUTHORIZATION: '@sap_web-User-Authorization',
  USER_UUID: '@sap_web-User-uuid',
  USER_NAME: '@sap_web-User-username',
  TOKEN_EXPIRY: '@sap_web-Token-Expiry',
} as const;

// Helper functions for token management
const tokenStorage = {
  get: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
  set: (token: string) => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
  remove: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),
};

const tokenExpiryStorage = {
  get: () => localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY),
  set: (expiry: string) =>
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry),
  remove: () => localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
};

// Function to check if token is expired
export const isTokenExpired = (): boolean => {
  try {
    const expiry = tokenExpiryStorage.get();
    if (!expiry) return false; // No expiry time means we don't know, assume not expired

    const expiryTime = new Date(expiry);
    return expiryTime <= new Date();
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return false; // In case of any error, assume token is not expired
  }
};

// Store user data to localStorage for legacy compatibility
const saveUserDataToLocalStorage = (userData: {
  token: string;
  role: UserRole;
  uuid: string;
  username?: string;
}): void => {
  // Save token with 24-hour expiration
  tokenStorage.set(userData.token);
  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + 24);
  tokenExpiryStorage.set(expiryTime.toISOString());

  // Save other user info
  localStorage.setItem(STORAGE_KEYS.USER_AUTHORIZATION, userData.role);
  localStorage.setItem(STORAGE_KEYS.USER_UUID, userData.uuid);
  if (userData.username) {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, userData.username);
  }
};

// Clear all user data from localStorage
const clearUserDataFromLocalStorage = (): void => {
  tokenStorage.remove();
  tokenExpiryStorage.remove();
  localStorage.removeItem(STORAGE_KEYS.USER_AUTHORIZATION);
  localStorage.removeItem(STORAGE_KEYS.USER_UUID);
  localStorage.removeItem(STORAGE_KEYS.USER_NAME);
};

// Define state type
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Define actions type
interface AuthActions {
  login: (credentials: LoginRequest) => Promise<boolean>;
  setUser: (loginResponse: LoginResponse) => void;
  logout: () => void;
  getRole: () => UserRole | null;
}

// Create store with separated state and actions
const useAuthStoreBase = create<AuthState & { actions: AuthActions }>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      // Actions
      actions: {
        login: async (credentials: LoginRequest) => {
          try {
            const response = await loginApi(credentials);

            if (response.success) {
              get().actions.setUser({
                ...response.dados,
                username: credentials.usuario,
              });
              return true;
            }
            return false;
          } catch (error) {
            console.error('Login error:', error);
            return false;
          }
        },

        setUser: (loginResponse: LoginResponse) => {
          const role = loginResponse.administrador
            ? UserRole.ADMIN
            : UserRole.USER;

          // Recuperar nome de usuário do localStorage se não estiver na resposta
          const storedUsername = localStorage.getItem('@sap_web-User-username');

          // Criar objeto de usuário com dados
          const userData = {
            uuid: loginResponse.uuid,
            role,
            token: loginResponse.token,
            username: storedUsername || '', // Usar nome armazenado ou string vazia
          };

          // Salvar para localStorage para compatibilidade legada
          saveUserDataToLocalStorage(userData);

          // Atualizar estado Zustand
          set({
            user: userData,
            isAuthenticated: true,
            isAdmin: role === UserRole.ADMIN,
          });
        },

        logout: () => {
          // Clear localStorage
          clearUserDataFromLocalStorage();

          // Reset Zustand state
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
          });
        },

        getRole: () => get().user?.role || null,
      },
    }),
    {
      name: 'auth-storage',
      // Only persist these fields
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
      // Use a custom storage to handle JSON parsing/stringifying
      storage: createJSONStorage(() => localStorage),
      // Add an onRehydrate callback to check token expiration when store loads
      onRehydrateStorage: () => state => {
        // Check token expiration on rehydration
        try {
          if (state?.isAuthenticated && isTokenExpired()) {
            // Clear the store if token is expired
            clearUserDataFromLocalStorage();
            // This will update the state after rehydration
            setTimeout(() => {
              const actions = useAuthActions();
              actions.logout();
            }, 0);
          }
        } catch (error) {
          console.error('Error in rehydration:', error);
        }
      },
    },
  ),
);

// Custom hooks for selectors (atomic selectors)
export const useIsAuthenticated = () =>
  useAuthStoreBase(state => state.isAuthenticated);
export const useIsAdmin = () => useAuthStoreBase(state => state.isAdmin);
export const useUser = () => useAuthStoreBase(state => state.user);
export const useUsername = () =>
  useAuthStoreBase(state => state.user?.username);
export const useAuthActions = () => useAuthStoreBase(state => state.actions);

// Use consistent navigation approach for auth-related redirects
export const logoutAndRedirect = () => {
  // Get the logout function from the store
  const { logout } = useAuthActions();

  // Logout the user
  logout();

  // Redirect to login page
  navigateToLogin();
};
