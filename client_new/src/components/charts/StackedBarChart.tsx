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
import { Typography, Paper, Box, useTheme, useMediaQuery } from '@mui/material';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate responsive height
  const responsiveHeight = isMobile
    ? Math.min(300, height)
    : isTablet
      ? Math.min(350, height)
      : height;

  // Simplified data for mobile
  const displayData =
    isMobile && data.length > 8
      ? data.slice(0, 8) // Show only first 8 items on mobile
      : data;

  // If stacked100 is true, convert data to percentages
  const chartData = useMemo(() => {
    if (!stacked100) return displayData;

    return displayData.map(item => {
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
  }, [displayData, series, stacked100]);

  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        height: responsiveHeight,
        p: isMobile ? 1 : 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant={isMobile ? 'subtitle1' : 'h6'}
        align="center"
        gutterBottom
      >
        {title}
      </Typography>

      {isMobile && data.length > 8 && (
        <Typography variant="caption" align="center" color="text.secondary">
          Mostrando 8 dos {data.length} itens
        </Typography>
      )}

      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: isMobile ? 0 : 30,
              left: isMobile ? 0 : 20,
              bottom: isMobile ? 20 : 5,
            }}
            barSize={isMobile ? 15 : undefined}
            layout={isMobile && data.length > 5 ? 'vertical' : 'horizontal'}
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* Conditional axes based on layout */}
            {isMobile && data.length > 5 ? (
              <>
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={80}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={stacked100 ? value => `${value}%` : undefined}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  interval={isMobile ? 1 : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  tickFormatter={stacked100 ? value => `${value}%` : undefined}
                  width={isMobile ? 30 : 40}
                />
              </>
            )}

            <Tooltip
              wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              contentStyle={{ padding: isMobile ? 4 : 8 }}
              formatter={(value: number, name: string) => [
                stacked100 ? `${value.toFixed(2)}%` : value,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              verticalAlign={isMobile ? 'top' : 'bottom'}
              height={36}
            />

            {series.map(s => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                stackId="a"
                fill={s.color}
              >
                {stacked100 && !isMobile && (
                  <LabelList
                    dataKey={s.dataKey}
                    position="inside"
                    formatter={(value: number) =>
                      value > 10 ? `${Math.round(value)}%` : ''
                    }
                    fill="white"
                    fontSize={10}
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
