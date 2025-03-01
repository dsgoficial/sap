// Path: features\map\components\MapLegend.tsx
import { Box, Typography } from '@mui/material';
import { LegendItem } from '../types';

interface MapLegendProps {
  items: LegendItem[];
}

const MapLegend = ({ items }: MapLegendProps) => {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Legend
      </Typography>
      {items.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box 
            sx={{ 
              width: 16, 
              height: 16, 
              backgroundColor: item.color,
              border: `${item.border ? '2px' : '1px'} solid ${item.border ? '#FF0000' : '#050505'}`,
              mr: 1
            }} 
          />
          <Typography variant="caption">
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default MapLegend;