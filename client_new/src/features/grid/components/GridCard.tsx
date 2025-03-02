// Path: features\grid\components\GridCard.tsx
import { useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
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

  const countTotal = grid.grade.length;
  const countVisited = grid.grade.filter(item => item.visited).length;
  const progressPercentage =
    countTotal > 0 ? ((countVisited / countTotal) * 100).toFixed(2) : '0';

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '5px',
      }}
    >
      <CardContent
        sx={{
          width: '100%',
          padding: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '1px',
        }}
      >
        {countTotal > 0 && <Typography>{`${progressPercentage}%`}</Typography>}

        <Typography>
          {currentMouseover && formatDate(currentMouseover.data_atualizacao)}
        </Typography>
      </CardContent>

      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '0px',
          width: '250px',
          height: '250px',
        }}
      >
        {countTotal > 0 && (
          <Grid
            id={id.toString()}
            data={grid}
            onItemHover={item => setCurrentMouseover(item)}
          />
        )}
      </CardContent>

      <CardContent
        sx={{
          width: '100%',
          padding: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {[
          formatDate(grid.data_inicio),
          grid.usuario,
          `${grid.projeto || '-'}-${grid.lote || '-'}`,
          `${grid.fase || '-'}-${grid.bloco || '-'}`,
          `${grid.subfase || '-'}-${grid.etapa || '-'}`,
        ].map((label, idx) => (
          <Typography
            key={idx}
            sx={{
              textAlign: 'center',
              inlineSize: '250px',
              overflowWrap: 'break-word',
            }}
          >
            {label}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
};
