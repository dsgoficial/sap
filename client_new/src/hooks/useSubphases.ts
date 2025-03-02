// Path: hooks\useSubphases.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getActivitySubphase,
  getSubphasesSituation,
  getUserActivities,
} from '@/services/subphaseService';
import { ChartGroup, TimelineGroup } from '@/types/subphase';

export const useActivitySubphase = () => {
  const [graphs, setGraphs] = useState<TimelineGroup[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['activitySubphase'],
    queryFn: getActivitySubphase,
  });

  // Transform the data exactly like the original implementation
  useEffect(() => {
    if (!data?.dados) return;

    const transformData = () => {
      const graphsData: TimelineGroup[] = [];
      let lastLotName: string | null = null;
      let lastLot: TimelineGroup | null = null;
      let count = 0;

      for (let [i, lot] of data.dados.entries()) {
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
          data: lot.data.map(item => {
            // Ensure correct data format [startDate, status, endDate]
            return [item[0], item[1], item[2]];
          }),
        });

        if (data.dados.length - 1 === i) {
          if (lastLot) graphsData.push(lastLot);
        }
      }

      setGraphs(graphsData);
    };

    transformData();
  }, [data]);

  return {
    data: graphs,
    isLoading,
    error,
  };
};

export const useSubphaseSituation = () => {
  return useQuery({
    queryKey: ['subphaseSituation'],
    queryFn: getSubphasesSituation,
    select: data => {
      // Transform data for visualization
      const groupedData: Record<
        string,
        {
          dataPointA: { label: string; y: number }[];
          dataPointB: { label: string; y: number }[];
        }
      > = {};

      data.dados.forEach((element: any) => {
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
};

export const useUserActivities = () => {
  const [graphs, setGraphs] = useState<TimelineGroup[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['userActivities'],
    queryFn: getUserActivities,
  });

  // Transform the data exactly like the original implementation
  useEffect(() => {
    if (!data?.dados) return;

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
          dataset: data.dados.map((item: any) => {
            return {
              measure: item.usuario,
              data: item.data.map((dataItem: any) => {
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
  }, [data]);

  return {
    data: graphs,
    isLoading,
    error,
  };
};
