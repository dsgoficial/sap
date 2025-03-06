// Path: features\map\components\MapLegend.tsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { LegendItem } from '@/types/map';

interface MapLegendProps {
  items: LegendItem[];
}

const MapLegend: React.FC<MapLegendProps> = ({ items }) => {
  const theme = useTheme();

  if (items.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ color: theme.palette.text.primary, mb: 1 }}
      >
        Legenda
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: item.color,
                border: `${item.border ? '2px' : '1px'} solid ${
                  item.border ? '#FF0000' : '#050505'
                }`,
                mr: 1,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.primary,
                lineHeight: 1.2,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default React.memo(MapLegend);
