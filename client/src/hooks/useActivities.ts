// Path: hooks\useActivities.ts
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorReport } from '../types/activity';
import { useActivityService } from '@/services/activityService';
import {
  STALE_TIMES,
  standardizeError,
  createQueryKey,
} from '@/lib/queryClient';

const QUERY_KEYS = {
  CURRENT_ACTIVITY: createQueryKey('currentActivity'),
  ERROR_TYPES: createQueryKey('errorTypes'),
};

export const useActivities = () => {
  const queryClient = useQueryClient();
  const activityService = useActivityService();

  const {
    data: currentActivityData,
    isLoading: isLoadingActivity,
    error: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: QUERY_KEYS.CURRENT_ACTIVITY,
    queryFn: activityService.getCurrentActivity,
    staleTime: STALE_TIMES.FREQUENT_DATA, // Activity data changes frequently
  });

  // Get error types
  const { data: errorTypesData } = useQuery({
    queryKey: QUERY_KEYS.ERROR_TYPES,
    queryFn: activityService.getErrorTypes,
    staleTime: STALE_TIMES.REFERENCE_DATA, // Error types rarely change
  });

  // Start activity mutation
  const startActivityMutation = useMutation({
    mutationFn: activityService.startActivity,
    onSuccess: () => {
      // Invalidate current activity to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_ACTIVITY });
    },
    onMutate: async () => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CURRENT_ACTIVITY,
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(
        QUERY_KEYS.CURRENT_ACTIVITY,
      );

      // Optimistically update to a loading/pending state
      queryClient.setQueryData(QUERY_KEYS.CURRENT_ACTIVITY, {
        success: true,
        message: 'Starting activity...',
        dados: {
          atividade: {
            id: 'pending',
            nome: 'Iniciando atividade...',
            dado_producao: {
              tipo_dado_producao_id: 1,
            },
          },
        },
      });

      // Return a context object with the snapshot
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.CURRENT_ACTIVITY,
          context.previousData,
        );
      }
      console.error('Error starting activity:', error);
    },
  });

  // Finish activity mutation
  const finishActivityMutation = useMutation({
    mutationFn: activityService.finishActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_ACTIVITY });
    },
    // Add optimistic update for finishing activity
    onMutate: async activityId => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CURRENT_ACTIVITY,
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(
        QUERY_KEYS.CURRENT_ACTIVITY,
      );

      // Optimistically update to a loading/pending state
      queryClient.setQueryData(QUERY_KEYS.CURRENT_ACTIVITY, {
        success: true,
        message: 'Finalizing activity...',
        dados: {
          atividade: null, // Assuming finishing means no current activity
        },
      });

      return { previousData, activityId };
    },
    onError: (error, _variables, context) => {
      // Roll back to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(
          QUERY_KEYS.CURRENT_ACTIVITY,
          context.previousData,
        );
      }
      console.error('Error finishing activity:', error);
    },
  });

  // Report error mutation
  const reportErrorMutation = useMutation({
    mutationFn: activityService.reportError,
    // No need to invalidate since reporting an error doesn't change the current activity
  });

  // Helper functions
  const handleStartActivity = useCallback(async () => {
    const response = await startActivityMutation.mutateAsync();
    return response; // Return the full response to access the message
  }, [startActivityMutation]);

  const handleFinishActivity = useCallback(
    (activityId: string) => {
      return finishActivityMutation.mutateAsync(activityId);
    },
    [finishActivityMutation],
  );

  const handleReportError = useCallback(
    (errorData: ErrorReport) => {
      return reportErrorMutation.mutateAsync(errorData);
    },
    [reportErrorMutation],
  );

  // Extract activity data
  const currentActivity = currentActivityData?.dados?.atividade || null;
  const errorTypes = errorTypesData?.dados || [];
  const activityByQgis =
    currentActivity?.dado_producao?.tipo_dado_producao_id !== 1;

  // Standardize error objects
  const standardizedActivityError = activityError
    ? standardizeError(activityError)
    : null;
  const standardizedStartError = startActivityMutation.error
    ? standardizeError(startActivityMutation.error)
    : null;
  const standardizedFinishError = finishActivityMutation.error
    ? standardizeError(finishActivityMutation.error)
    : null;
  const standardizedReportError = reportErrorMutation.error
    ? standardizeError(reportErrorMutation.error)
    : null;

  return {
    // Data
    currentActivity,
    errorTypes,
    activityByQgis,

    // Loading states
    isLoadingActivity,
    isStartingActivity: startActivityMutation.isPending,
    isFinishingActivity: finishActivityMutation.isPending,
    isReportingError: reportErrorMutation.isPending,

    // Error states
    activityError: standardizedActivityError,
    startActivityError: standardizedStartError,
    finishActivityError: standardizedFinishError,
    reportErrorError: standardizedReportError,

    // Actions
    startActivity: handleStartActivity,
    finishActivity: handleFinishActivity,
    reportError: handleReportError,
    refetchActivity,
  };
};
