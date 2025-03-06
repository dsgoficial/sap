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
  FormattedCompletedActivity,
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

// Format date with timezone handling
const formatTimestampWithTimezone = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    // Parse the date, handling common UTC formats that might lack a timezone indicator
    let date;

    // If the dateString already has a timezone indicator, use it as is
    if (
      dateString.includes('Z') ||
      dateString.includes('+') ||
      dateString.match(/\d-\d{2}:\d{2}$/)
    ) {
      date = new Date(dateString);
    } else {
      // If it doesn't have a timezone indicator, assume it's UTC
      if (dateString.includes('T')) {
        // ISO format without timezone
        date = new Date(dateString + 'Z');
      } else if (dateString.includes(' ') && dateString.includes(':')) {
        // "YYYY-MM-DD HH:MM:SS" format
        date = new Date(dateString.replace(' ', 'T') + 'Z');
      } else {
        // Fallback
        date = new Date(dateString);
      }
    }

    // Format using locale string to convert to user's timezone
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
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
          data_inicio: formatTimestampWithTimezone(item.data_inicio),
          duration: formatDuration(item.duracao),
        }),
      );
    },
  });

  // Fixed the return type of select to FormattedCompletedActivity[]
  const completedActivitiesQuery = useQuery<
    ApiResponse<CompletedActivity[]>,
    unknown,
    FormattedCompletedActivity[]
  >({
    queryKey: QUERY_KEYS.COMPLETED_ACTIVITIES,
    queryFn: getLastCompletedActivities,
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
