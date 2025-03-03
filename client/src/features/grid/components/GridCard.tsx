// Path: features\grid\components\GridCard.tsx
import { useState, useMemo } from 'react';
import {
  Typography,
  CardContent,
  Card,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Grid } from './Grid';
import { GridData, GridItem } from '@/types/grid';
import { formatDate } from '@/utils/formatters';

interface GridCardProps {
  id: number;
  grid: GridData;
}

export const GridCard = ({ id, grid }: GridCardProps) => {
  const [currentMouseover, setCurrentMouseover] = useState<GridItem | null>(
    null,
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { countTotal, progressPercentage } = useMemo(() => {
    const countTotal = grid.grade.length;
    const countVisited = grid.grade.filter(item => item.visited).length;
    const progressPercentage =
      countTotal > 0 ? ((countVisited / countTotal) * 100).toFixed(2) : '0';
    return { countTotal, progressPercentage };
  }, [grid.grade]);

  // Calculate responsive grid size
  const gridSize = useMemo(() => {
    if (isMobile) return { width: '100%', height: 200 };
    if (isTablet) return { width: 220, height: 220 };
    return { width: 250, height: 250 };
  }, [isMobile, isTablet]);

  // Format display info to prevent overflow on small screens
  const gridInfo = useMemo(() => {
    return [
      formatDate(grid.data_inicio),
      grid.usuario,
      `${grid.projeto || '-'}-${grid.lote || '-'}`,
      `${grid.fase || '-'}-${grid.bloco || '-'}`,
      `${grid.subfase || '-'}-${grid.etapa || '-'}`,
    ];
  }, [grid]);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 2, md: 3 },
        padding: { xs: '4px', sm: '5px' },
        width: { xs: '100%', sm: 'auto' },
        maxWidth: '100%',
      }}
    >
      <CardContent
        sx={{
          width: '100%',
          padding: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: 'auto',
          minHeight: { xs: 20, sm: 30 },
        }}
      >
        {countTotal > 0 && (
          <Typography variant={isMobile ? 'body2' : 'body1'}>
            {`${progressPercentage}%`}
          </Typography>
        )}

        <Typography variant={isMobile ? 'caption' : 'body2'} noWrap>
          {currentMouseover && formatDate(currentMouseover.data_atualizacao)}
        </Typography>
      </CardContent>

      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '0px',
          width: '100%',
          minHeight: gridSize.height,
          padding: { xs: 1, sm: 2 },
        }}
      >
        {countTotal > 0 && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Grid
              id={id.toString()}
              data={grid}
              onItemHover={item => setCurrentMouseover(item)}
            />
          </Box>
        )}
      </CardContent>

      <CardContent
        sx={{
          width: '100%',
          padding: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {gridInfo.map((label, idx) => (
          <Typography
            key={idx}
            variant={isMobile ? 'caption' : 'body2'}
            sx={{
              textAlign: 'center',
              maxWidth: '100%',
              px: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
};
