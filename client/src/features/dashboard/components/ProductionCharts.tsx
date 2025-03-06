// Path: features\dashboard\components\ProductionCharts.tsx
import { Grid, Box, Skeleton } from '@mui/material';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';
import { StackedBarChart } from '@/components/charts/StackedBarChart';
import { DashboardData } from '@/types/dashboard';
import { useMemo } from 'react';

interface ProductionChartsProps {
  data?: DashboardData;
  isLoading: boolean;
}

export const ProductionCharts = ({
  data,
  isLoading,
}: ProductionChartsProps) => {
  const pieData = useMemo(() => {
    if (!data) return [];
    
    const completed = Math.max(0, data.summary.completedProducts);
    const running = Math.max(0, data.summary.runningProducts);
    const notStarted = Math.max(0, data.summary.totalProducts - (completed + running));
    
    return [
      {
        label: 'Finalizados',
        value: completed,
        color: '#7A9D54',
      },
      {
        label: 'Não Iniciado',
        value: notStarted,
        color: '#F24C3D',
      },
      {
        label: 'Em Execução',
        value: running,
        color: '#4FC0D0',
      },
    ];
  }, [data]);

  // Format bar chart series
  const barSeries = [
    { dataKey: 'completed', name: 'Finalizados', color: '#7A9D54' },
    { dataKey: 'running', name: 'Em Execução', color: '#4FC0D0' },
    { dataKey: 'notStarted', name: 'Não Iniciado', color: '#F24C3D' },
  ];

  // Format monthly series
  const monthlyChartSeries = useMemo(() => {
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
  }, [data]);

  // Filter monthly data to only show up to current month
  const filteredMonthlyData = useMemo(() => {
    if (!data) return [];
    
    const currentMonth = new Date().getMonth(); // 0-based index
    return data.monthlyData
      .filter((_, index) => index <= currentMonth)
      .map(monthData => {
        const newMonthData: { [key: string]: string | number } = { month: monthData.month };
        
        Object.keys(monthData).forEach(key => {
          if (key !== 'month' && key in monthData) {
            newMonthData[key] = typeof monthData[key] === 'string' 
              ? Number(monthData[key]) 
              : monthData[key];
          }
        });
        
        return newMonthData;
      });
  }, [data]);

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
          data={filteredMonthlyData}
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
