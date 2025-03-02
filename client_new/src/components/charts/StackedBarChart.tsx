// Path: components\charts\StackedBarChart.tsx
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Typography, Paper, Box } from '@mui/material';

interface StackedBarDataPoint {
  name: string;
  [key: string]: string | number;
}

interface StackedBarSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface StackedBarChartProps {
  title: string;
  data: StackedBarDataPoint[];
  series: StackedBarSeries[];
  height?: number;
  stacked100?: boolean;
}

export const StackedBarChart = ({
  title,
  data,
  series,
  height = 400,
  stacked100 = false,
}: StackedBarChartProps) => {
  // If stacked100 is true, convert data to percentages
  const chartData = useMemo(() => {
    if (!stacked100) return data;

    return data.map(item => {
      const total = series.reduce(
        (acc, { dataKey }) => acc + (Number(item[dataKey]) || 0),
        0,
      );
      const newItem: StackedBarDataPoint = { name: item.name };

      series.forEach(({ dataKey }) => {
        const value = Number(item[dataKey]) || 0;
        newItem[dataKey] = total === 0 ? 0 : (value / total) * 100;
      });

      return newItem;
    });
  }, [data, series, stacked100]);

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
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              tickFormatter={stacked100 ? value => `${value}%` : undefined}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                stacked100 ? `${value.toFixed(2)}%` : value,
                name,
              ]}
            />
            <Legend />

            {series.map(s => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                stackId="a"
                fill={s.color}
              >
                {stacked100 && (
                  <LabelList
                    dataKey={s.dataKey}
                    position="inside"
                    formatter={(value: number) =>
                      value > 5 ? `${Math.round(value)}%` : ''
                    }
                    fill="white"
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
