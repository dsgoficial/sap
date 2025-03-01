// Path: features\subphases\components\Timeline.tsx
import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TimelineGroup } from '../types';

// This is a wrapper for the visavail library
// You'll need to import the visavail library properly in your project
// Alternatively, you can reimplement the timeline visualization with d3.js

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  '& .visavail': {
    position: 'relative',
  },
  '& .visavail-tooltip div.tooltip-top': {
    position: 'absolute',
    textAlign: 'left',
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    paddingLeft: 0,
    width: 'auto',
    border: 0,
    pointerEvents: 'none',
    lineHeight: '12px',
    paddingTop: 0,
    display: 'block',
  },
  '& .visavail-tooltip div.tooltip-overlay': {
    position: 'absolute',
    textAlign: 'left',
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    width: 120,
    border: 0,
    pointerEvents: 'none',
    lineHeight: 16,
    background: '#f2f2f2',
    padding: 10,
    borderRadius: 4,
  },
}));

interface TimelineProps {
  data: TimelineGroup;
}

declare global {
  interface Window {
    visavail: {
      generate: (options: any, dataset: any) => void;
    };
  }
}

export const Timeline = ({ data }: TimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.visavail) {
      try {
        window.visavail.generate(data.options, data.dataset);
      } catch (error) {
        console.error('Error generating timeline:', error);
      }
    }
  }, [data]);

  return (
    <Paper elevation={1} sx={{ p: 2, width: '100%', mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {data.options.title.text}
      </Typography>
      
      <TimelineContainer>
        <div
          className="visavail"
          id={data.idContainer}
          ref={containerRef}
        >
          <div id={data.idBar} style={{ width: '100%' }}></div>
        </div>
      </TimelineContainer>
    </Paper>
  );
};

export default Timeline;