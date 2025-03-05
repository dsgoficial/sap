// Path: hooks\useSubphases.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getActivitySubphase,
  getSubphasesSituation,
  getUserActivities,
} from '@/services/subphaseService';
import { ChartGroup, TimelineGroup, SubphaseData } from '@/types/subphase';
import {
  createQueryKey,
  STALE_TIMES,
  standardizeError,
} from '@/lib/queryClient';
import { ApiResponse } from '@/types/api';

const QUERY_KEYS = {
  ACTIVITY_SUBPHASE: createQueryKey('activitySubphase'),
  SUBPHASES_SITUATION: createQueryKey('subphasesSituation'),
  USER_ACTIVITIES: createQueryKey('userActivities'),
};

export const useActivitySubphase = () => {
  const [graphs, setGraphs] = useState<TimelineGroup[]>([]);

  const query = useQuery<
    ApiResponse<SubphaseData[]>,
    unknown,
    ApiResponse<SubphaseData[]>
  >({
    queryKey: QUERY_KEYS.ACTIVITY_SUBPHASE,
    queryFn: getActivitySubphase,
    staleTime: STALE_TIMES.FREQUENT_DATA, // Activity subphase data changes frequently
  });

  // Transform the data exactly like the original implementation
  useEffect(() => {
    if (!query.data?.dados) return;

    const transformData = () => {
      const graphsData: TimelineGroup[] = [];
      let lastLotName: string | null = null;
      let lastLot: TimelineGroup | null = null;
      let count = 0;

      for (let [i, lot] of query.data.dados.entries()) {
        if (!lastLot || lastLotName !== lot.lote) {
          if (lastLot) graphsData.push(lastLot);

          lastLotName = lot.lote;
          count += 1;

          const idContainer = `alarm_bar_container-${count}`;
          const idBar = `alarm_bar_div-${count}`;

          lastLot = {
            idContainer,
            idBar,
            title: lot.lote,
            options: {
              title: {
                text: lot.lote,
              },
              id_div_container: idContainer,
              id_div_graph: idBar,
              date_in_utc: false,
              line_spacing: 24,
              tooltip: {
                height: 18,
                position: 'overlay',
                left_spacing: 20,
                only_first_date: true,
                date_plus_time: true,
              },
              responsive: {
                enabled: true,
              },
            },
            dataset: [],
          };
        }

        lastLot.dataset.push({
          measure: lot.subfase,
          data: lot.data.map((item: [string, string, string]) => {
            // Ensure correct data format [startDate, status, endDate]
            return [item[0], item[1], item[2]];
          }),
        });

        if (query.data.dados.length - 1 === i) {
          if (lastLot) graphsData.push(lastLot);
        }
      }

      setGraphs(graphsData);
    };

    transformData();
  }, [query.data]);

  return {
    data: graphs,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? standardizeError(query.error) : null,
    refetch: query.refetch,
  };
};

// Define the type for situation data from API
interface SituationData {
  bloco: string;
  subfase: string;
  finalizadas: number;
  nao_finalizadas: number;
}

export const useSubphaseSituation = () => {
  const query = useQuery<ApiResponse<SituationData[]>, unknown, ChartGroup[]>({
    queryKey: QUERY_KEYS.SUBPHASES_SITUATION,
    queryFn: getSubphasesSituation,
    staleTime: STALE_TIMES.FREQUENT_DATA, // Subphase situation data changes frequently
    select: data => {
      // Transform data for visualization
      const groupedData: Record<
        string,
        {
          dataPointA: { label: string; y: number }[];
          dataPointB: { label: string; y: number }[];
        }
      > = {};

      data.dados.forEach((element: SituationData) => {
        if (!groupedData[element.bloco]) {
          groupedData[element.bloco] = {
            dataPointA: [],
            dataPointB: [],
          };
        }

        groupedData[element.bloco].dataPointA.push({
          label: element.subfase,
          y: element.finalizadas,
        });

        groupedData[element.bloco].dataPointB.push({
          label: element.subfase,
          y: element.nao_finalizadas ? +element.nao_finalizadas : 0,
        });
      });

      const chartGroups: ChartGroup[] = Object.keys(groupedData).map(key => ({
        title: key,
        dataPointA: groupedData[key].dataPointA.reverse(),
        dataPointB: groupedData[key].dataPointB.reverse(),
      }));

      return chartGroups;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? standardizeError(query.error) : null,
    refetch: query.refetch,
  };
};

// Define the type for user activity data
interface UserActivityData {
  usuario: string;
  data: [string, string, string][];
}

export const useUserActivities = () => {
  const [graphs, setGraphs] = useState<TimelineGroup[]>([]);

  const query = useQuery<
    ApiResponse<UserActivityData[]>,
    unknown,
    ApiResponse<UserActivityData[]>
  >({
    queryKey: QUERY_KEYS.USER_ACTIVITIES,
    queryFn: getUserActivities,
    staleTime: STALE_TIMES.FREQUENT_DATA, // User activities data changes frequently
  });

  // Transform the data exactly like the original implementation
  useEffect(() => {
    if (!query.data?.dados) return;

    const transformData = () => {
      const graphsData: TimelineGroup[] = [
        {
          idContainer: `user_bar_container-0`,
          idBar: `user_bar_div-0`,
          title: 'Atividades por Usuário',
          options: {
            title: {
              text: `Atividades por Usuário`,
            },
            id_div_container: `user_bar_container-0`,
            id_div_graph: `user_bar_div-0`,
            date_in_utc: false,
            line_spacing: 24,
            tooltip: {
              height: 18,
              position: 'overlay',
              left_spacing: 20,
              only_first_date: true,
              date_plus_time: true,
            },
            responsive: {
              enabled: true,
            },
          },
          dataset: query.data.dados.map((item: UserActivityData) => {
            return {
              measure: item.usuario,
              data: item.data.map((dataItem: [string, string, string]) => {
                // Ensure correct data format [startDate, status, endDate]
                return [dataItem[0], dataItem[1], dataItem[2]];
              }),
            };
          }),
        },
      ];

      setGraphs(graphsData);
    };

    transformData();
  }, [query.data]);

  return {
    data: graphs,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? standardizeError(query.error) : null,
    refetch: query.refetch,
  };
};
