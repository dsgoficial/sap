// Path: components\timeline\VisavailTimeline.tsx
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { EnhancedTimeline, TimelineGroup, TimelineItem } from './EnhancedTimeline';

interface VisavailDataPoint {
  startDate: Date;
  endDate: Date;
  status: string;
}

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
  date_in_utc: boolean;
  line_spacing: number;
  tooltip: {
    height: number;
    position: string;
    left_spacing: number;
    only_first_date: boolean;
    date_plus_time: boolean;
  };
  responsive: {
    enabled: boolean;
  };
  [key: string]: any;
}

interface VisavailTimelineProps {
  idContainer: string;
  idBar: string;
  options: VisavailOptions;
  dataset: VisavailDataset[];
}

export const VisavailTimeline: React.FC<VisavailTimelineProps> = ({
  idContainer,
  idBar,
  options,
  dataset
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Transform visavail dataset into our timeline format
  const transformedGroups: TimelineGroup[] = dataset.map(item => {
    const timelineItems: TimelineItem[] = item.data.map(([startDateStr, status, endDateStr]) => {
      // Parse dates
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      return {
        startDate,
        endDate,
        status,
        label: `${startDateStr} - ${endDateStr}`
      };
    });
    
    return {
      title: item.measure,
      data: timelineItems
    };
  });

  // Initialize container divs to match original implementation
  useEffect(() => {
    if (containerRef.current) {
      // Create container structure that matches visavail's expected DOM
      containerRef.current.id = idContainer;
      
      // Ensure the inner div for the chart exists
      if (!document.getElementById(idBar)) {
        const barDiv = document.createElement('div');
        barDiv.id = idBar;
        barDiv.style.width = '100%';
        containerRef.current.appendChild(barDiv);
      }
    }
  }, [idContainer, idBar]);
  
  return (
    <Box ref={containerRef} className="visavail" sx={{ width: '100%' }}>
      <EnhancedTimeline 
        title={options.title.text} 
        groups={transformedGroups}
        height={500}
      />
    </Box>
  );
};

export default VisavailTimeline;