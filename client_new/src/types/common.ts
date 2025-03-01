// Path: types\common.ts
/**
 * Tipos comuns utilizados em toda a aplicação
 */

// Tipo para paginação
export interface Pagination {
    page: number;
    limit: number;
    total: number;
  }
  
  // Tipo para ordenação
  export interface Sorting<T> {
    field: keyof T;
    order: 'asc' | 'desc';
  }
  
  // Tipo para filtros genéricos
  export interface Filter {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
    value: string | number | boolean | null;
  }
  
  // Tipo para resposta genérica
  export interface ApiResponseBase {
    success: boolean;
    message: string;
  }
  
  // Tipo para usuário autenticado
  export interface AuthUser {
    uuid: string;
    role: 'ADMIN' | 'USER';
    username?: string;
  }
  
  // Tipo para tema
  export type ThemeMode = 'light' | 'dark';
  
  // Tipo para notificação
  export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
    read?: boolean;
  }
  
  // Tipo para dados base de entidade
  export interface BaseEntity {
    id: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  // Tipo para erro
  export interface AppError extends Error {
    code?: string;
    status?: number;
    details?: Record<string, any>;
  }