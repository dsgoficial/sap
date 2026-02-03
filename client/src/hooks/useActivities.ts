// Path: hooks\useActivities.ts
import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ErrorReport } from '../types/activity';
import { ApiResponse } from '../types/api';
import {
  getCurrentActivity,
  getErrorTypes,
  startActivity,
  finishActivity,
  reportError,
} from '@/services/activityService';
import {
  STALE_TIMES,
  standardizeError,
  createQueryKey,
} from '@/lib/queryClient';
import axios from 'axios';
import type { CancelTokenSource } from 'axios';
import { createCancelToken } from '@/utils/apiErrorHandler';

const QUERY_KEYS = {
  CURRENT_ACTIVITY: createQueryKey('currentActivity'),
  ERROR_TYPES: createQueryKey('errorTypes'),
};

export const useActivities = () => {
  const queryClient = useQueryClient();
  // Referências para tokens de cancelamento
  const currentActivityCancelTokenRef = useRef<CancelTokenSource | null>(null);
  const errorTypesCancelTokenRef = useRef<CancelTokenSource | null>(null);

  // Criar novos tokens de cancelamento
  useEffect(() => {
    currentActivityCancelTokenRef.current = createCancelToken();
    errorTypesCancelTokenRef.current = createCancelToken();

    // Cleanup - cancelar requisições pendentes quando o componente for desmontado
    return () => {
      if (currentActivityCancelTokenRef.current) {
        currentActivityCancelTokenRef.current.cancel('Component unmounted');
      }
      if (errorTypesCancelTokenRef.current) {
        errorTypesCancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Query para atividade atual
  const {
    data: currentActivityData,
    isLoading: isLoadingActivity,
    error: activityError,
    refetch: refetchActivity,
  } = useQuery({
    queryKey: QUERY_KEYS.CURRENT_ACTIVITY,
    queryFn: () =>
      getCurrentActivity(currentActivityCancelTokenRef.current || undefined),
    staleTime: STALE_TIMES.FREQUENT_DATA, // Activity data changes frequently
    retry: (failureCount, error) => {
      // Não tentar novamente se for um erro de cancelamento
      if (axios.isCancel(error)) return false;
      return failureCount < 3;
    },
  });

  // Query para tipos de erro
  const { data: errorTypesData } = useQuery({
    queryKey: QUERY_KEYS.ERROR_TYPES,
    queryFn: () => getErrorTypes(errorTypesCancelTokenRef.current || undefined),
    staleTime: STALE_TIMES.REFERENCE_DATA, // Error types rarely change
    retry: (failureCount, error) => {
      // Não tentar novamente se for um erro de cancelamento
      if (axios.isCancel(error)) return false;
      return failureCount < 3;
    },
  });

  // Mutation para iniciar atividade
  const startActivityMutation = useMutation<
    ApiResponse<unknown>,
    Error,
    void,
    { previousData: unknown }
  >({
    mutationFn: () => startActivity(),
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

  // Mutation para finalizar atividade
  const finishActivityMutation = useMutation<
    ApiResponse<unknown>,
    Error,
    string,
    { previousData: unknown; activityId: string }
  >({
    mutationFn: (activityId: string) => finishActivity(activityId),
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

  // Mutation para reportar erro
  const reportErrorMutation = useMutation<ApiResponse<unknown>, Error, ErrorReport>({
    mutationFn: (errorData: ErrorReport) => reportError(errorData),
    // No need to invalidate since reporting an error doesn't change the current activity
  });

  // Helper functions
  const handleStartActivity = useCallback(async () => {
    // Chama o método mutateAsync sem argumentos, corrigido para estar de acordo com a tipagem
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
