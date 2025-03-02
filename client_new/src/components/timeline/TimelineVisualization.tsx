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
  height?: number;
}

export const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  options,
  dataset,
  height = 500,
}) => {
  const transformedGroups: TimelineGroup[] = dataset.map(item => {
    const timelineItems: TimelineItem[] = item.data.map(
      ([startDateStr, status, endDateStr]) => {
        // Parse dates
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        return {
          startDate,
          endDate,
          status,
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
      <EnhancedTimeline
        title={options.title.text}
        groups={transformedGroups}
        height={height}
      />
    </Box>
  );
};
