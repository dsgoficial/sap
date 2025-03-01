// Path: types\auth.ts
/**
 * User role enum
 */
export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
  }
  
  /**
   * User authentication data
   */
  export interface User {
    uuid: string;
    role: UserRole;
    token: string;
    username?: string;
  }
  
  /**
   * Login request payload
   */
  export interface LoginRequest {
    usuario: string;
    senha: string;
  }
  
  /**
   * Login response from the API
   */
  export interface LoginResponse {
    token: string;
    administrador: boolean;
    uuid: string;
  }