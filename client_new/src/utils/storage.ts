// Path: utils\storage.ts

// Chaves de armazenamento
export const STORAGE_KEYS = {
    TOKEN: '@sap_web-Token',
    USER_AUTHORIZATION: '@sap_web-User-Authorization',
    USER_UUID: '@sap_web-User-uuid',
    USER_PREFERENCES: '@sap_web-User-Preferences',
    THEME: '@sap_web-Theme',
    LANGUAGE: '@sap_web-Language',
    SIDEBAR_STATE: '@sap_web-Sidebar-State'
  };
  
  /**
   * Interface para usuário
   */
  export interface StoredUser {
    token: string;
    role: string;
    uuid: string;
  }
  
  /**
   * Interface para preferências
   */
  export interface UserPreferences {
    theme: 'light' | 'dark';
    language: string;
    sidebarOpen: boolean;
    dashboardLayout?: string[];
  }
  
  /**
   * Salva um valor no localStorage
   * @param key Chave de armazenamento
   * @param value Valor a ser armazenado
   * @returns Boolean indicando sucesso
   */
  export const setStorageItem = <T>(key: string, value: T): boolean => {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      return false;
    }
  };
  
  /**
   * Recupera um valor do localStorage
   * @param key Chave de armazenamento
   * @returns Valor armazenado ou null
   */
  export const getStorageItem = <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  };
  
  /**
   * Remove um valor do localStorage
   * @param key Chave de armazenamento
   * @returns Boolean indicando sucesso
   */
  export const removeStorageItem = (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  };
  
  /**
   * Salva dados do usuário
   * @param user Dados do usuário
   */
  export const saveUser = (user: StoredUser): void => {
    setStorageItem(STORAGE_KEYS.TOKEN, user.token);
    setStorageItem(STORAGE_KEYS.USER_AUTHORIZATION, user.role);
    setStorageItem(STORAGE_KEYS.USER_UUID, user.uuid);
  };
  
  /**
   * Recupera dados do usuário
   * @returns Dados do usuário ou null
   */
  export const getUser = (): StoredUser | null => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const role = localStorage.getItem(STORAGE_KEYS.USER_AUTHORIZATION);
    const uuid = localStorage.getItem(STORAGE_KEYS.USER_UUID);
    
    if (!token || !role || !uuid) return null;
    
    return { token, role, uuid };
  };
  
  /**
   * Remove dados do usuário
   */
  export const clearUser = (): void => {
    removeStorageItem(STORAGE_KEYS.TOKEN);
    removeStorageItem(STORAGE_KEYS.USER_AUTHORIZATION);
    removeStorageItem(STORAGE_KEYS.USER_UUID);
  };
  
  /**
   * Salva preferências do usuário
   * @param preferences Preferências do usuário
   */
  export const saveUserPreferences = (preferences: UserPreferences): void => {
    setStorageItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
    
    // Também salva as preferências individuais para compatibilidade
    if (preferences.theme) setStorageItem(STORAGE_KEYS.THEME, preferences.theme);
    if (preferences.language) setStorageItem(STORAGE_KEYS.LANGUAGE, preferences.language);
    if (preferences.sidebarOpen !== undefined) setStorageItem(STORAGE_KEYS.SIDEBAR_STATE, preferences.sidebarOpen);
  };
  
  /**
   * Recupera preferências do usuário
   * @returns Preferências do usuário
   */
  export const getUserPreferences = (): UserPreferences => {
    const storedPreferences = getStorageItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    
    // Valores padrão
    const defaultPreferences: UserPreferences = {
      theme: 'light',
      language: 'pt-BR',
      sidebarOpen: false
    };
    
    // Se tiver preferências armazenadas, usa elas, senão usa os padrões
    return storedPreferences || defaultPreferences;
  };