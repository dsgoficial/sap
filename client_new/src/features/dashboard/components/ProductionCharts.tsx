// Path: features\dashboard\components\ProductionCharts.tsx
import { Grid, Box, Skeleton } from '@mui/material';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';
import { StackedBarChart } from '@/components/charts/StackedBarChart';
import { DashboardData } from '@/types/dashboard';

interface ProductionChartsProps {
  data?: DashboardData;
  isLoading: boolean;
}

export const ProductionCharts = ({
  data,
  isLoading,
}: ProductionChartsProps) => {
  // Format pie chart data
  const pieData = data
    ? [
        {
          label: 'Finalizados',
          value: data.summary.completedProducts,
          color: '#7A9D54',
        },
        {
          label: 'Não Iniciado',
          value:
            data.summary.totalProducts -
            (data.summary.completedProducts + data.summary.runningProducts),
          color: '#F24C3D',
        },
        {
          label: 'Em Execução',
          value: data.summary.runningProducts,
          color: '#4FC0D0',
        },
      ]
    : [];

  // Format bar chart series
  const barSeries = [
    { dataKey: 'completed', name: 'Finalizados', color: '#7A9D54' },
    { dataKey: 'running', name: 'Em Execução', color: '#4FC0D0' },
    { dataKey: 'notStarted', name: 'Não Iniciado', color: '#F24C3D' },
  ];

  // Format monthly series
  const getMonthlyChartSeries = () => {
    if (!data || !data.monthlyData[0]) return [];

    // Find keys that start with lot_
    const lotKeys = Object.keys(data.monthlyData[0]).filter(key =>
      key.startsWith('lot_'),
    );

    // Create series for each lot
    const colors = [
      '#8884d8',
      '#83a6ed',
      '#8dd1e1',
      '#82ca9d',
      '#a4de6c',
      '#d0ed57',
      '#ffc658',
    ];

    return lotKeys.map((key, index) => ({
      dataKey: key,
      name: key.replace('lot_', 'Lote '),
      color: colors[index % colors.length],
    }));
  };

  const monthlyChartSeries = getMonthlyChartSeries();

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={400} />
        </Grid>
      </Grid>
    );
  }

  if (!data) {
    return <Box>No data available</Box>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <PieChart title="Status dos Produtos" data={pieData} height={300} />
      </Grid>
      <Grid item xs={12} md={6}>
        <BarChart
          title="Produtos Por Mês"
          data={data.monthlyData}
          series={monthlyChartSeries}
          xAxisDataKey="month"
          height={300}
          stacked
        />
      </Grid>
      <Grid item xs={12}>
        <StackedBarChart
          title="Atividades Por Lote"
          data={data.lotProgressData}
          series={barSeries}
          height={400}
          stacked100
        />
      </Grid>
    </Grid>
  );
};
