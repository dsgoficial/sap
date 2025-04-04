// Path: hooks\useMicroControl.ts
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getRunningActivities,
  getLastCompletedActivities,
} from '@/services/activityMonitoringService';
import {
  FormattedRunningActivity,
  RunningActivity,
  CompletedActivity,
  Duration,
  FormattedCompletedActivity,
} from '@/types/microControl';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { ApiResponse } from '@/types/api';
import axios, { CancelTokenSource } from 'axios';
import { createCancelToken } from '@/utils/apiErrorHandler';
import { formatTimestampWithTimezone } from '@/utils/dateFormatters';

// Define query keys
const QUERY_KEYS = {
  RUNNING_ACTIVITIES: createQueryKey('runningActivities'),
  COMPLETED_ACTIVITIES: createQueryKey('completedActivities'),
};

/**
 * Formata a duração de uma atividade
 * @param duracao Objeto de duração com dias, horas, minutos e segundos
 * @returns String formatada com a duração
 */
const formatDuration = (duracao: Duration | undefined): string => {
  if (!duracao) return '';

  const parts = [];

  if (duracao.days !== undefined) parts.push(`Dias: ${duracao.days}`);
  if (duracao.hours !== undefined) parts.push(`Horas: ${duracao.hours}`);
  if (duracao.minutes !== undefined) parts.push(`Minutos: ${duracao.minutes}`);
  if (duracao.seconds !== undefined) parts.push(`Segundos: ${duracao.seconds}`);

  return parts.join(', ');
};

export const useMicroControlData = () => {
  // Referências para tokens de cancelamento
  const runningActivitiesCancelTokenRef = useRef<CancelTokenSource | null>(
    null,
  );
  const completedActivitiesCancelTokenRef = useRef<CancelTokenSource | null>(
    null,
  );

  // Criar novos tokens de cancelamento quando o componente for montado
  useEffect(() => {
    runningActivitiesCancelTokenRef.current = createCancelToken();
    completedActivitiesCancelTokenRef.current = createCancelToken();

    // Cleanup - cancelar requisições pendentes quando o componente for desmontado
    return () => {
      if (runningActivitiesCancelTokenRef.current) {
        runningActivitiesCancelTokenRef.current.cancel('Component unmounted');
      }
      if (completedActivitiesCancelTokenRef.current) {
        completedActivitiesCancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Fixed the return type of select to FormattedRunningActivity[]
  const runningActivitiesQuery = useQuery<
    ApiResponse<RunningActivity[]>,
    unknown,
    FormattedRunningActivity[]
  >({
    queryKey: QUERY_KEYS.RUNNING_ACTIVITIES,
    queryFn: () =>
      getRunningActivities(
        runningActivitiesCancelTokenRef.current || undefined,
      ),
    staleTime: STALE_TIMES.FREQUENT_DATA, // Running activities change frequently
    select: data => {
      return data.dados.map(
        (item: RunningActivity): FormattedRunningActivity => ({
          ...item,
          data_inicio: formatTimestampWithTimezone(item.data_inicio),
          duration: formatDuration(item.duracao),
        }),
      );
    },
    retry: (failureCount, error) => {
      // Não tentar novamente se for um erro de cancelamento
      if (axios.isCancel(error)) return false;
      return failureCount < 3;
    },
  });

  // Fixed the return type of select to FormattedCompletedActivity[]
  const completedActivitiesQuery = useQuery<
    ApiResponse<CompletedActivity[]>,
    unknown,
    FormattedCompletedActivity[]
  >({
    queryKey: QUERY_KEYS.COMPLETED_ACTIVITIES,
    queryFn: () =>
      getLastCompletedActivities(
        completedActivitiesCancelTokenRef.current || undefined,
      ),
    staleTime: STALE_TIMES.FREQUENT_DATA, // Completed activities change frequently
    select: data => {
      return data.dados.map(
        (item: CompletedActivity): FormattedCompletedActivity => ({
          ...item,
          data_inicio: formatTimestampWithTimezone(item.data_inicio),
          data_fim: formatTimestampWithTimezone(item.data_fim),
        }),
      );
    },
    retry: (failureCount, error) => {
      // Não tentar novamente se for um erro de cancelamento
      if (axios.isCancel(error)) return false;
      return failureCount < 3;
    },
  });

  return {
    runningActivities: runningActivitiesQuery.data || [],
    completedActivities: completedActivitiesQuery.data || [],
    isLoadingRunning: runningActivitiesQuery.isLoading,
    isLoadingCompleted: completedActivitiesQuery.isLoading,
    isLoading:
      runningActivitiesQuery.isLoading || completedActivitiesQuery.isLoading,
    errorRunning: runningActivitiesQuery.error
      ? standardizeError(runningActivitiesQuery.error)
      : null,
    errorCompleted: completedActivitiesQuery.error
      ? standardizeError(completedActivitiesQuery.error)
      : null,
    error:
      runningActivitiesQuery.error || completedActivitiesQuery.error
        ? standardizeError(
            runningActivitiesQuery.error || completedActivitiesQuery.error,
          )
        : null,
    refetchRunning: runningActivitiesQuery.refetch,
    refetchCompleted: completedActivitiesQuery.refetch,
  };
};
