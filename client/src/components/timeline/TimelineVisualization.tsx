// Path: components\timeline\TimelineVisualization.tsx
import React from 'react';
import {
  EnhancedTimeline,
  TimelineGroup,
  TimelineItem,
} from './EnhancedTimeline';
import { Box } from '@mui/material';

interface VisavailDataset {
  measure: string;
  data: Array<[string, string, string]>; // [start_date, status, end_date]
}

interface VisavailOptions {
  title: {
    text: string;
  };
  id_div_container: string;
  id_div_graph: string;
  date_in_utc?: boolean;
  line_spacing?: number;
  tooltip?: {
    height?: number;
    position?: string;
    left_spacing?: number;
    only_first_date?: boolean;
    date_plus_time?: boolean;
  };
  responsive?: {
    enabled?: boolean;
  };
  [key: string]: any;
}

interface TimelineVisualizationProps {
  idContainer?: string;
  idBar?: string;
  options: VisavailOptions;
  dataset: VisavailDataset[];
}

// 'YYYY-MM-DD' sem hora é interpretado como meia-noite UTC pelo construtor
// de Date, o que desloca o dia no fuso local (UTC-3 exibe o dia anterior).
const parseLocalDate = (value: string): Date =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

export const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  options,
  dataset,
}) => {
  const transformedGroups: TimelineGroup[] = dataset.map(item => {
    const timelineItems: TimelineItem[] = item.data.map(
      ([startDateStr, status, endDateStr]) => {
        // Parse dates
        const startDate = parseLocalDate(startDateStr);
        const endDate = parseLocalDate(endDateStr);

        return {
          startDate,
          endDate,
          status, // Keep status as is - the EnhancedTimeline now handles both string and number formats
          label: `${startDateStr} - ${endDateStr}`,
        };
      },
    );

    return {
      title: item.measure,
      data: timelineItems,
    };
  });

  return (
    <Box className="visavail" sx={{ width: '100%' }}>
      <EnhancedTimeline title={options.title.text} groups={transformedGroups} />
    </Box>
  );
};
