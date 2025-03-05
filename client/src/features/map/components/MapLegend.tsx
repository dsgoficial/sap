// Path: features\map\components\MapLegend.tsx
import { Box, Typography, useTheme } from '@mui/material';
import { LegendItem } from '@/types/map';

interface MapLegendProps {
  items: LegendItem[];
}

const MapLegend = ({ items }: MapLegendProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ color: theme.palette.text.primary }}
      >
        Legenda
      </Typography>
      {items.map((item, index) => (
        <Box
          key={index}
          sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: item.color,
              border: `${item.border ? '2px' : '1px'} solid ${
                item.border
              ? '#FF0000'
                : '#050505'
              }`,
              mr: 1,
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.primary }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default MapLegend;
