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
  
  /**
   * Pagination parameters for API requests
   */
  export interface PaginationParams {
    page: number;
    limit: number;
  }
  
  /**
   * Pagination metadata in responses
   */
  export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }
  
  /**
   * Paginated response wrapper
   */
  export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
  }