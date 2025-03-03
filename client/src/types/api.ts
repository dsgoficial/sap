// Path: types\api.ts
/**
 * Generic API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  dados: T;
}

/**
 * Error response from API
 */
export interface ApiError {
  message: string;
  status?: number;
}
