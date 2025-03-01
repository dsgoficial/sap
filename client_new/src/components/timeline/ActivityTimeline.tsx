// Path: components\timeline\ActivityTimeline.tsx
import { useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box } from '@mui/material';
import TimelineItem from './TimelineItem';

export interface TimelineDataPoint {
  startDate: Date;
  endDate: Date;
  status: string;
}

export interface TimelineGroup {
  title: string;
  data: TimelineDataPoint[];
}

interface ActivityTimelineProps {
  title: string;
  groups: TimelineGroup[];
  height?: number;
}

const TimelineContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  overflowX: 'auto',
  overflowY: 'hidden',
  '&::-webkit-scrollbar': {
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.light,
    borderRadius: 4,
  },
}));

const TimelineHeader = styled(Box)({
  display: 'flex',
  borderBottom: '1px solid #e0e0e0',
  position: 'sticky',
  top: 0,
  backgroundColor: 'white',
  zIndex: 1,
});

const TimelineContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

const TimelineRow = styled(Box)({
  display: 'flex',
  height: 40,
  borderBottom: '1px solid #f5f5f5',
  position: 'relative',
});

const TimelineLabel = styled(Box)(({ theme }) => ({
  width: 200,
  minWidth: 200,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRight: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
}));

const TimelineMain = styled(Box)({
  flexGrow: 1,
  position: 'relative',
  paddingTop: 10,
});

export const ActivityTimeline = ({ 
  title, 
  groups, 
  height = 500 
}: ActivityTimelineProps) => {
  // Calculate date range
  const { minDate, maxDate, totalDays } = useMemo(() => {
    let min = new Date();
    let max = new Date();
    
    groups.forEach(group => {
      group.data.forEach(item => {
        if (item.startDate < min) min = new Date(item.startDate);
        if (item.endDate > max) max = new Date(item.endDate);
      });
    });
    
    // Add buffer days
    min.setDate(min.getDate() - 1);
    max.setDate(max.getDate() + 1);
    
    // Calculate total days
    const diffTime = Math.abs(max.getTime() - min.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      minDate: min,
      maxDate: max,
      totalDays: diffDays
    };
  }, [groups]);
  
  // Generate month labels
  const monthLabels = useMemo(() => {
    const months: { label: string, position: number }[] = [];
    let currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      // Calculate position
      const daysSinceStart = Math.floor((monthStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      const position = (daysSinceStart / totalDays) * 100;
      
      months.push({
        label: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        position
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  }, [minDate, maxDate, totalDays]);
  
  // Calculate position for a date
  const getPositionForDate = (date: Date) => {
    const daysSinceStart = Math.floor((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceStart / totalDays) * 100;
  };
  
  return (
    <Paper elevation={1} sx={{ width: '100%', height, overflow: 'hidden' }}>
      <Typography variant="h6" align="center" p={2}>
        {title}
      </Typography>
      
      <TimelineContainer sx={{ height: height - 80 }}>
        <TimelineHeader>
          <TimelineLabel>
            <Typography variant="subtitle2">Subfase</Typography>
          </TimelineLabel>
          <TimelineMain style={{ height: 40 }}>
            {monthLabels.map((month, index) => (
              <Typography 
                key={index}
                variant="caption"
                sx={{ 
                  position: 'absolute',
                  left: `${month.position}%`,
                  transform: 'translateX(-50%)',
                  borderLeft: '1px solid #e0e0e0',
                  paddingLeft: 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {month.label}
              </Typography>
            ))}
          </TimelineMain>
        </TimelineHeader>
        
        <TimelineContent>
          {groups.map((group, groupIndex) => (
            <TimelineRow key={groupIndex}>
              <TimelineLabel>
                <Typography variant="body2" noWrap>
                  {group.title}
                </Typography>
              </TimelineLabel>
              
              <TimelineMain>
                {group.data.map((item, itemIndex) => {
                  const startPosition = getPositionForDate(item.startDate);
                  const endPosition = getPositionForDate(item.endDate);
                  const width = endPosition - startPosition;
                  
                  return (
                    <TimelineItem
                      key={itemIndex}
                      start={startPosition}
                      width={width}
                      color={item.status === '1' ? '#4CAF50' : '#F44336'}
                      title={`${item.startDate.toLocaleDateString()} - ${item.endDate.toLocaleDateString()}`}
                    />
                  );
                })}
              </TimelineMain>
            </TimelineRow>
          ))}
        </TimelineContent>
      </TimelineContainer>
    </Paper>
  );
};