// Path: features\microControl\hooks\useMicroControl.ts
import { useQuery } from '@tanstack/react-query';
import { getRunningActivities, getLastCompletedActivities } from '../../../services/activityMonitoringService';
import { FormattedRunningActivity, RunningActivity, Duration } from '../types';

export const useMicroControlData = () => {
  const runningActivitiesQuery = useQuery({
    queryKey: ['runningActivities'],
    queryFn: getRunningActivities,
    select: (data) => {
      return data.dados.map((item: RunningActivity): FormattedRunningActivity => ({
        ...item,
        duration: formatDuration(item.duracao)
      }));
    }
  });
  
  const completedActivitiesQuery = useQuery({
    queryKey: ['completedActivities'],
    queryFn: getLastCompletedActivities,
    select: (data) => data.dados
  });
  
  return {
    runningActivities: runningActivitiesQuery.data || [],
    completedActivities: completedActivitiesQuery.data || [],
    isLoadingRunning: runningActivitiesQuery.isLoading,
    isLoadingCompleted: completedActivitiesQuery.isLoading,
    isLoading: runningActivitiesQuery.isLoading || completedActivitiesQuery.isLoading,
    errorRunning: runningActivitiesQuery.error,
    errorCompleted: completedActivitiesQuery.error,
    error: runningActivitiesQuery.error || completedActivitiesQuery.error
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