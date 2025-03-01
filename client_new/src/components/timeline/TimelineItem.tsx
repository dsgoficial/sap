// Path: components\timeline\TimelineItem.tsx
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Tooltip } from '@mui/material';

interface TimelineItemProps {
  start: number;
  width: number;
  color: string;
  title: string;
}

const Item = styled('div', {
  shouldForwardProp: (prop) => prop !== 'width' && prop !== 'start' && prop !== 'color'
})<{ width: number; start: number; color: string }>(({ width, start, color }) => ({
  position: 'absolute',
  height: 20,
  borderRadius: 4,
  backgroundColor: color,
  left: `${start}%`,
  width: `${Math.max(width, 0.5)}%`,
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scaleY(1.1)',
    zIndex: 10
  }
}));

const TimelineItem = ({ start, width, color, title }: TimelineItemProps) => {
  return (
    <Tooltip title={title} arrow placement="top">
      <Item start={start} width={width} color={color} />
    </Tooltip>
  );
};

export default TimelineItem;