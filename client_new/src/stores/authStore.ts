// Path: stores\authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, LoginResponse } from '../types/auth';

// Storage keys
const TOKEN_KEY = '@sap_web-Token';
const USER_AUTHORIZATION_KEY = '@sap_web-User-Authorization';
const USER_UUID_KEY = '@sap_web-User-uuid';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
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
      
      setUser: (loginResponse: LoginResponse) => {
        const role = loginResponse.administrador ? UserRole.ADMIN : UserRole.USER;
        
        // Save to localStorage for legacy compatibility
        localStorage.setItem(TOKEN_KEY, loginResponse.token);
        localStorage.setItem(USER_AUTHORIZATION_KEY, role);
        localStorage.setItem(USER_UUID_KEY, loginResponse.uuid);
        
        set({
          user: {
            uuid: loginResponse.uuid,
            role,
            token: loginResponse.token,
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
    }
  )
);