// Path: hooks\useActivities.ts
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorReport } from '../types/activity';
import { useActivityService } from '@/services/activityService';

export const useActivities = () => {
  const queryClient = useQueryClient();
  const activityService = useActivityService();

  // Get current activity
  const {
    data: currentActivityData,
    isLoading: isLoadingActivity,
    error: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: ['currentActivity'],
    queryFn: activityService.getCurrentActivity,
  });

  // Get error types
  const { data: errorTypesData } = useQuery({
    queryKey: ['errorTypes'],
    queryFn: activityService.getErrorTypes,
    staleTime: Infinity, // Error types rarely change
  });

  // Start activity mutation
  const startActivityMutation = useMutation({
    mutationFn: activityService.startActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentActivity'] });
    },
  });

  // Finish activity mutation
  const finishActivityMutation = useMutation({
    mutationFn: activityService.finishActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentActivity'] });
    },
  });

  // Report error mutation
  const reportErrorMutation = useMutation({
    mutationFn: activityService.reportError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentActivity'] });
    },
  });

  // Helper functions
  const handleStartActivity = useCallback(() => {
    return startActivityMutation.mutateAsync();
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
    activityError,
    startActivityError: startActivityMutation.error,
    finishActivityError: finishActivityMutation.error,
    reportErrorError: reportErrorMutation.error,

    // Actions
    startActivity: handleStartActivity,
    finishActivity: handleFinishActivity,
    reportError: handleReportError,
    refetchActivity,
  };
};
