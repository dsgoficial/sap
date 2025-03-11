// Path: features\grid\components\GridCard.tsx
import { useState, useMemo } from 'react';
import { Typography, Card, Box, useTheme, Alert } from '@mui/material';
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

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const countTotal = grid.grade?.length || 0;
    const countVisited = grid.grade?.filter(item => item.visited)?.length || 0;
    const progressPercentage =
      countTotal > 0 ? ((countVisited / countTotal) * 100).toFixed(2) : '0';
    return progressPercentage;
  }, [grid.grade]);

  // Format project information
  const projectInfo = useMemo(() => grid.projeto || '', [grid]);
  const lotInfo = useMemo(() => grid.lote || '', [grid]);

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return '';
    try {
      // Parse the date, handling common UTC formats that might lack a timezone indicator
      let date;

      // If the dateString already has a timezone indicator, use it as is
      if (
        dateString.includes('Z') ||
        dateString.includes('+') ||
        dateString.match(/\d-\d{2}:\d{2}$/)
      ) {
        date = new Date(dateString);
      } else {
        // If it doesn't have a timezone indicator, assume it's UTC
        if (dateString.includes('T')) {
          // ISO format without timezone
          date = new Date(dateString + 'Z');
        } else if (dateString.includes(' ') && dateString.includes(':')) {
          // "YYYY-MM-DD HH:MM:SS" format
          date = new Date(dateString.replace(' ', 'T') + 'Z');
        } else {
          // Fallback
          date = new Date(dateString);
        }
      }

      // Format using locale string to convert to user's timezone
      return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Card dimensions
  const CARD_WIDTH = 380;
  const CARD_HEIGHT = 480;

  // Check if grid data is empty or undefined
  const hasGridData = grid.grade && grid.grade.length > 0;

  return (
    <Card
      elevation={3}
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        margin: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: theme.palette.background.paper,
        transition: theme.transitions.create(
          ['background-color', 'box-shadow'],
          {
            duration: theme.transitions.duration.standard,
          },
        ),
      }}
    >
      {/* Header section */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            fontWeight: 'medium',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {projectInfo}
        </Typography>

        <Typography
          variant="subtitle2"
          align="center"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {lotInfo}
        </Typography>
      </Box>

      {/* Date display area */}
      <Box
        sx={{
          py: 0.5,
          px: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.action.hover,
        }}
      >
        <Typography variant="caption">
          {currentMouseover?.data_atualizacao
            ? `Atualização: ${formatTimestamp(currentMouseover.data_atualizacao)}`
            : 'Passe o mouse sobre as células'}
        </Typography>
      </Box>

      {/* Grid visualization */}
      <Box
        sx={{
          flexGrow: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 250,
        }}
      >
        {hasGridData ? (
          <Grid
            id={id.toString()}
            data={grid}
            onItemHover={setCurrentMouseover}
          />
        ) : (
          <Alert 
            severity="info" 
            sx={{ 
              width: '90%', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'auto'
            }}
          >
            Nenhum dado de grade disponível para esta atividade.
          </Alert>
        )}
      </Box>

      {/* Footer section */}
      <Box
        sx={{
          pt: 1,
          px: 1.5,
          pb: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        {/* Progress */}
        <Typography
          variant="body2"
          align="center"
          sx={{ fontWeight: 'medium' }}
        >
          {`Progresso: ${progressPercentage}%`}
        </Typography>

        {/* Operator */}
        <Typography variant="body2" align="center" sx={{ mb: 0.5 }}>
          {`Operador: ${grid.usuario || '-'}`}
        </Typography>

        {/* Simplified additional info with ellipsis */}
        <Typography
          variant="caption"
          align="center"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {`${grid.fase || '-'} - ${grid.bloco || '-'}`}
        </Typography>

        <Typography
          variant="caption"
          align="center"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {`${grid.subfase || '-'} - ${grid.etapa || '-'}`}
        </Typography>

        {/* Start date */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="span"
            sx={{ fontWeight: 'medium', mr: 0.5 }}
          >
            Data de início:
          </Typography>
          <Typography variant="caption" component="span">
            {formatDate(grid.data_inicio)}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};
