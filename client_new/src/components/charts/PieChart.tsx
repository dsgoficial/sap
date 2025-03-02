// Path: components\charts\PieChart.tsx
import { useMemo } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Typography, Box, Paper } from '@mui/material';

interface PieChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title: string;
  data: PieChartDataPoint[];
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

// Default colors if none provided
const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const PieChart = ({
  title,
  data,
  height = 300,
  showLegend = true,
  showLabels = true,
}: PieChartProps) => {
  // Transform data for Recharts format
  const chartData = useMemo(
    () =>
      data.map(item => ({
        name: item.label,
        value: item.value,
      })),
    [data],
  );

  // Custom label renderer
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    if (!showLabels) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        height,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>

      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              dataKey="value"
              isAnimationActive={true}
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              label={renderCustomizedLabel}
              outerRadius="70%"
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    data[index].color ||
                    DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                  }
                />
              ))}
            </Pie>
            {showLegend && <Legend />}
            <Tooltip
              formatter={(value: number) => [`${value}`, 'Valor']}
              labelFormatter={name => `${name}`}
            />
          </RechartsPie>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
