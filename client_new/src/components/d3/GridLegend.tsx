// Path: components\d3\GridLegend.tsx
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LegendItem {
  label: string;
  color: string;
}

interface GridLegendProps {
  items: LegendItem[];
  title?: string;
}

const LegendContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

const LegendItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ColorBox = styled(Box)<{ color: string }>(({ color }) => ({
  width: 16,
  height: 16,
  backgroundColor: color,
  border: '1px solid #ccc',
}));

export const GridLegend = ({ items, title }: GridLegendProps) => {
  return (
    <Paper elevation={1} sx={{ p: 1, maxWidth: 'fit-content' }}>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
      )}
      
      <LegendContainer>
        {items.map((item, index) => (
          <LegendItemContainer key={index}>
            <ColorBox color={item.color} />
            <Typography variant="caption">{item.label}</Typography>
          </LegendItemContainer>
        ))}
      </LegendContainer>
    </Paper>
  );
};