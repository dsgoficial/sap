// Path: features\fieldActivities\components\management\EstatisticasPanel.tsx
import { useMemo } from 'react';
import { Box, Grid, CircularProgress, Alert, Paper } from '@mui/material';
import { useEstatisticasCampos } from '@/hooks/useFieldManagement';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';

export const EstatisticasPanel = () => {
  const { data, isLoading, error } = useEstatisticasCampos();

  const pieSituacao = useMemo(
    () =>
      (data?.por_situacao ?? []).map(item => ({
        label: item.situacao ?? '—',
        value: Number(item.quantidade) || 0,
      })),
    [data],
  );

  const pieCategoria = useMemo(
    () =>
      (data?.por_categoria ?? []).map(item => ({
        label: item.categoria ?? '—',
        value: Number(item.quantidade) || 0,
      })),
    [data],
  );

  const barPit = useMemo(
    () =>
      (data?.por_pit ?? []).map(item => ({
        pit: String(item.pit ?? '—'),
        quantidade: Number(item.quantidade) || 0,
      })),
    [data],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error">Erro ao carregar estatísticas dos campos.</Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <PieChart title="Campos por situação" data={pieSituacao} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <PieChart title="Campos por categoria" data={pieCategoria} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <BarChart
              title="Campos por PIT"
              data={barPit}
              xAxisDataKey="pit"
              series={[{ dataKey: 'quantidade', name: 'Quantidade' }]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EstatisticasPanel;
