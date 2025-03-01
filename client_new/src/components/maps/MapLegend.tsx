// Path: components\maps\MapLegend.tsx
import { Box, Typography } from '@mui/material';

interface LegendItem {
  label: string;
  color: string;
  hasBorder: boolean;
}

const legendItems: LegendItem[] = [
  { label: 'Preparo não iniciada', color: 'rgb(175,141,195)', hasBorder: false },
  { label: 'Preparo em execução', color: 'rgb(175,141,195)', hasBorder: true },
  { label: 'Extração não iniciada', color: 'rgb(252,141,89)', hasBorder: false },
  { label: 'Extração em execução', color: 'rgb(252,141,89)', hasBorder: true },
  { label: 'Validação não iniciada', color: 'rgb(255,255,191)', hasBorder: false },
  { label: 'Validação em execução', color: 'rgb(255,255,191)', hasBorder: true },
  { label: 'Disseminação não iniciada', color: 'rgb(145,207,96)', hasBorder: false },
  { label: 'Disseminação em execução', color: 'rgb(145,207,96)', hasBorder: true },
  { label: 'Concluído', color: 'rgb(26,152,80)', hasBorder: false }
];

const MapLegend = () => {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Legend
      </Typography>
      {legendItems.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Box 
            sx={{ 
              width: 16, 
              height: 16, 
              backgroundColor: item.color,
              border: `${item.hasBorder ? '2px' : '1px'} solid ${item.hasBorder ? '#FF0000' : '#050505'}`,
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