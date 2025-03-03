// Path: hooks\useMicroControl.ts
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
} from '@/types/microControl';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { ApiResponse } from '@/types/api';

// Define query keys
const QUERY_KEYS = {
  RUNNING_ACTIVITIES: createQueryKey('runningActivities'),
  COMPLETED_ACTIVITIES: createQueryKey('completedActivities'),
};

export const useMicroControlData = () => {
  // Fixed the return type of select to FormattedRunningActivity[]
  const runningActivitiesQuery = useQuery<
    ApiResponse<RunningActivity[]>,
    unknown,
    FormattedRunningActivity[]
  >({
    queryKey: QUERY_KEYS.RUNNING_ACTIVITIES,
    queryFn: getRunningActivities,
    staleTime: STALE_TIMES.FREQUENT_DATA, // Running activities change frequently
    select: data => {
      return data.dados.map(
        (item: RunningActivity): FormattedRunningActivity => ({
          ...item,
          duration: formatDuration(item.duracao),
        }),
      );
    },
  });

  // Fixed the return type of select to CompletedActivity[]
  const completedActivitiesQuery = useQuery<
    ApiResponse<CompletedActivity[]>,
    unknown,
    CompletedActivity[]
  >({
    queryKey: QUERY_KEYS.COMPLETED_ACTIVITIES,
    queryFn: getLastCompletedActivities,
    staleTime: STALE_TIMES.FREQUENT_DATA, // Completed activities change frequently
    select: data => data.dados,
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

const formatDuration = (duracao: Duration | undefined): string => {
  if (!duracao) return '';

  const parts = [];

  if (duracao.days !== undefined) parts.push(`Dias: ${duracao.days}`);
  if (duracao.hours !== undefined) parts.push(`Horas: ${duracao.hours}`);
  if (duracao.minutes !== undefined) parts.push(`Minutos: ${duracao.minutes}`);
  if (duracao.seconds !== undefined) parts.push(`Segundos: ${duracao.seconds}`);

  return parts.join(', ');
};
