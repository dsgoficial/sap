// Path: stores\authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, LoginResponse, LoginRequest } from '../types/auth';
import { login as loginApi } from '../services/authService';

// Storage keys
const TOKEN_KEY = '@sap_web-Token';
const USER_AUTHORIZATION_KEY = '@sap_web-User-Authorization';
const USER_UUID_KEY = '@sap_web-User-uuid';
const USER_NAME_KEY = '@sap_web-User-username';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  setUser: (loginResponse: LoginResponse) => void;
  logout: () => void;
  getRole: () => UserRole | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      login: async (credentials: LoginRequest) => {
        try {
          const response = await loginApi(credentials);

          if (response.success) {
            get().setUser({
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

        // Save to localStorage for legacy compatibility
        localStorage.setItem(TOKEN_KEY, loginResponse.token);
        localStorage.setItem(USER_AUTHORIZATION_KEY, role);
        localStorage.setItem(USER_UUID_KEY, loginResponse.uuid);
        if (loginResponse.username) {
          localStorage.setItem(USER_NAME_KEY, loginResponse.username);
        }

        set({
          user: {
            uuid: loginResponse.uuid,
            role,
            token: loginResponse.token,
            username: loginResponse.username,
          },
          isAuthenticated: true,
          isAdmin: role === UserRole.ADMIN,
        });
      },

      logout: () => {
        // Clear localStorage for legacy compatibility
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_AUTHORIZATION_KEY);
        localStorage.removeItem(USER_UUID_KEY);
        localStorage.removeItem(USER_NAME_KEY);

        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      getRole: () => get().user?.role || null,
    }),
    {
      name: 'auth-storage',
      // Only persist these fields
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);
