// Path: stores\authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole, LoginResponse } from '../types/auth';
import { navigateToLogin } from '../routes';
import queryClient from '../lib/queryClient';

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
    const token = tokenStorage.get();
    const expiry = tokenExpiryStorage.get();

    // Se não há token, considera como expirado (força re-login)
    if (!token) return true;

    // Se não há data de expiração mas há token, considera expirado por segurança
    if (!expiry) return true;

    const expiryTime = new Date(expiry);
    // Verifica se a data é válida
    if (isNaN(expiryTime.getTime())) return true;

    return expiryTime <= new Date();
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true; // Em caso de erro, assume expirado por segurança
  }
};

// Decodifica o claim `exp` do JWT (segundos desde epoch) e retorna como ISO string.
// O backend assina o token com expiração real (ex.: 10h); não fabricamos um prazo
// no cliente. Fallback conservador caso o token não seja um JWT decodificável.
const getTokenExpiry = (token: string): string => {
  try {
    const payload = token.split('.')[1];
    if (payload) {
      const decoded = JSON.parse(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
      );
      if (typeof decoded.exp === 'number') {
        return new Date(decoded.exp * 1000).toISOString();
      }
    }
  } catch {
    // Token não-JWT ou malformado: cai no fallback abaixo.
  }
  const fallback = new Date();
  fallback.setHours(fallback.getHours() + 8);
  return fallback.toISOString();
};

// Store user data to localStorage for legacy compatibility
const saveUserDataToLocalStorage = (userData: {
  token: string;
  role: UserRole;
  uuid: string;
  username?: string;
}): void => {
  // Expiração derivada do próprio token (claim `exp`), não fabricada no cliente.
  tokenStorage.set(userData.token);
  tokenExpiryStorage.set(getTokenExpiry(userData.token));

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
        setUser: (loginResponse: LoginResponse) => {
          const role = loginResponse.administrador
            ? UserRole.ADMIN
            : UserRole.USER;

          // Usar o username vindo na resposta (já preenchido a partir das
          // credenciais em useAuth), com fallback para o valor armazenado.
          const username =
            loginResponse.username ||
            localStorage.getItem(STORAGE_KEYS.USER_NAME) ||
            '';

          // Criar objeto de usuário com dados
          const userData = {
            uuid: loginResponse.uuid,
            role,
            token: loginResponse.token,
            username,
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

          // Limpar o cache do React Query para não vazar dados do usuário
          // anterior caso outro usuário faça login na mesma aba sem reload.
          queryClient.clear();

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
      // Only persist these fields. Não persistir o token dentro de `user`: a
      // fonte única do token é a chave localStorage '@sap_web-Token' (lida pelo
      // interceptor do axios), evitando duas cópias divergentes.
      partialize: state => ({
        user: state.user ? { ...state.user, token: '' } : null,
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
            // Resetar estado diretamente sem usar hooks
            setTimeout(() => {
              useAuthStoreBase.setState({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
              });
            }, 0);
          }
        } catch (error) {
          console.error('Error in rehydration:', error);
          // Em caso de erro na rehidratação, limpar tudo por segurança
          clearUserDataFromLocalStorage();
          setTimeout(() => {
            useAuthStoreBase.setState({
              user: null,
              isAuthenticated: false,
              isAdmin: false,
            });
          }, 0);
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
// NOTA: Esta função pode ser chamada fora de componentes React,
// por isso acessa o store diretamente em vez de usar hooks
export const logoutAndRedirect = () => {
  // Limpar localStorage diretamente
  clearUserDataFromLocalStorage();

  // Limpar o cache do React Query (cobre também expiração de token / 401,
  // já que o interceptor do axios chama esta função).
  queryClient.clear();

  // Resetar estado Zustand diretamente via getState/setState
  useAuthStoreBase.setState({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  });

  // Redirect to login page
  navigateToLogin();
};
