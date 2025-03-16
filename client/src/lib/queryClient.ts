// Path: lib\queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../types/api';

// Define default stale times based on data type
export const STALE_TIMES = {
  REFERENCE_DATA: 1000 * 60 * 30, // 30 minutes
  USER_DATA: 1000 * 60 * 5, // 5 minutes
  FREQUENT_DATA: 1000 * 60 * 1, // 1 minute
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: STALE_TIMES.USER_DATA, // Default to 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      // Consistent error handling
      throwOnError: false,
    },
    mutations: {
      // Don't retry mutations by default
      retry: 0,
    },
  },
});

// Helper function to standardize error responses
export const standardizeError = (error: unknown): ApiError => {
  if (error && typeof error === 'object' && 'message' in error) {
    return error as ApiError;
  }

  return {
    message:
      error instanceof Error ? error.message : 'An unexpected error occurred',
    status: undefined,
  };
};

// Helper function for creating consistent query keys
// Using a proper type union for the entityId parameter
export const createQueryKey = (
  entityType: string,
  entityId?: string | number,
  subResource?: string,
): (string | number)[] => {
  const key: (string | number)[] = [entityType];
  if (entityId !== undefined) key.push(entityId);
  if (subResource !== undefined) key.push(subResource);
  return key;
};

export default queryClient;
