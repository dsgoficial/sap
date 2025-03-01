// Path: hooks\useActivities.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { 
  getCurrentActivity, 
  startActivity, 
  finishActivity, 
  reportError,
  getErrorTypes
} from '../services/activityService';
import { ErrorReport } from '../types/activity';

export const useActivities = () => {
  const queryClient = useQueryClient();
  
  // Get current activity
  const {
    data: currentActivityData,
    isLoading: isLoadingActivity,
    error: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: ['currentActivity'],
    queryFn: getCurrentActivity,
  });
  
  // Get error types
  const {
    data: errorTypesData,
    isLoading: isLoadingErrorTypes,
  } = useQuery({
    queryKey: ['errorTypes'],
    queryFn: getErrorTypes,
    staleTime: Infinity, // Error types rarely change
  });
  
  // Start activity mutation
  const startActivityMutation = useMutation({
    mutationFn: startActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentActivity'] });
    },
  });
  
  // Finish activity mutation
  const finishActivityMutation = useMutation({
    mutationFn: (activityId: string) => finishActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentActivity'] });
    },
  });
  
  // Report error mutation
  const reportErrorMutation = useMutation({
    mutationFn: (errorData: ErrorReport) => reportError(errorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentActivity'] });
    },
  });
  
  // Helper functions
  const handleStartActivity = useCallback(() => {
    return startActivityMutation.mutateAsync();
  }, [startActivityMutation]);
  
  const handleFinishActivity = useCallback((activityId: string) => {
    return finishActivityMutation.mutateAsync(activityId);
  }, [finishActivityMutation]);
  
  const handleReportError = useCallback((errorData: ErrorReport) => {
    return reportErrorMutation.mutateAsync(errorData);
  }, [reportErrorMutation]);
  
  // Extract activity data
  const currentActivity = currentActivityData?.dados?.atividade || null;
  const errorTypes = errorTypesData?.dados || [];
  const activityByQgis = currentActivity?.dado_producao.tipo_dado_producao_id !== 1;
  
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