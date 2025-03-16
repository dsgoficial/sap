// Path: components\charts\StackedBarChart.tsx
import React, { useMemo } from 'react';
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
  TooltipProps,
} from 'recharts';
import { Typography, Paper, Box, useTheme, useMediaQuery } from '@mui/material';
import { useChartColors } from './ChartThemeConfig';

// Define our interfaces
interface StackedBarDataPoint {
  name: string;
  originalName?: string;
  [key: string]: string | number | undefined;
}

interface StackedBarSeries {
  dataKey: string;
  name: string;
  color?: string;
}

interface StackedBarChartProps {
  title: string;
  data: StackedBarDataPoint[];
  series: StackedBarSeries[];
  height?: number;
  stacked100?: boolean;
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;

  // Calculate total for this item
  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  // Get the original name from payload if available, otherwise use label
  const displayName = payload[0]?.payload?.originalName || label;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        p: 1.5,
        borderRadius: 1,
        boxShadow: 3,
        border: '1px solid',
        borderColor: 'divider',
        minWidth: 180,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {displayName}
      </Typography>
      {payload.map((entry, index) => {
        // Get original value from payload if available
        const rawValue =
          entry.payload[`${entry.dataKey}_raw`] || entry.value || 0;
        // Fix: Add safe handling for undefined value
        const percentage = ((entry.value || 0) / total) * 100;

        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  bgcolor: entry.color,
                  mr: 1,
                  borderRadius: '50%',
                }}
              />
              <Typography variant="body2">{entry.name}: </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {Math.round(rawValue)} ({percentage.toFixed(2)}%)
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export const StackedBarChart = React.memo(
  ({
    title,
    data,
    series,
    height = 400,
    stacked100 = false,
  }: StackedBarChartProps) => {
    const theme = useTheme();
    const chartColors = useChartColors();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isDark = theme.palette.mode === 'dark';

    // Calculate responsive height
    const responsiveHeight = useMemo(
      () =>
        isMobile
          ? Math.min(300, height)
          : isTablet
            ? Math.min(350, height)
            : height,
      [isMobile, isTablet, height],
    );

    // Simplified data for mobile
    const displayData = useMemo(() => {
      // Process data to ensure originalName is preserved
      const processedData = data.map(item => {
        const result: StackedBarDataPoint = {
          ...item,
          originalName: item.originalName || String(item.name),
        };
        return result;
      });

      return isMobile && processedData.length > 8
        ? processedData.slice(0, 8) // Show only first 8 items on mobile
        : processedData;
    }, [isMobile, data]);

    // Apply theme colors to series
    const themedSeries = useMemo(() => {
      return series.map((s, index) => ({
        ...s,
        color:
          s.color ||
          chartColors.seriesColors[index % chartColors.seriesColors.length],
      }));
    }, [series, chartColors.seriesColors]);

    // If stacked100 is true, convert data to percentages but keep original values
    const chartData = useMemo(() => {
      if (!stacked100) return displayData;

      return displayData.map(item => {
        // Use type assertion to make TypeScript happy with dynamic access
        const typedItem = item as Record<string, any>;

        // Calculate total across all series
        const total = themedSeries.reduce(
          (acc, { dataKey }) => acc + (Number(typedItem[dataKey]) || 0),
          0,
        );

        // Create a new result object with explicit type
        const result: Record<string, any> = {
          name: item.name,
          originalName: item.originalName || String(item.name),
        };

        // Add percentage values and store original values
        themedSeries.forEach(({ dataKey }) => {
          const value = Number(typedItem[dataKey]) || 0;

          // Store original raw value
          result[`${dataKey}_raw`] = value;

          // Calculate percentage
          result[dataKey] = total === 0 ? 0 : (value / total) * 100;
        });

        return result as StackedBarDataPoint;
      });
    }, [displayData, themedSeries, stacked100]);

    // Chart margin settings
    const chartMargin = useMemo(
      () => ({
        top: 20,
        right: isMobile ? 0 : 30,
        left: isMobile ? 0 : 20,
        bottom: isMobile ? 20 : 5,
      }),
      [isMobile],
    );

    // Bar size based on device
    const barSize = useMemo(() => (isMobile ? 15 : undefined), [isMobile]);

    // Chart layout based on device and data size
    const chartLayout = useMemo(
      () => (isMobile && data.length > 5 ? 'vertical' : 'horizontal'),
      [isMobile, data.length],
    );

    // Caption message for truncated data
    const truncatedDataMessage = useMemo(() => {
      if (isMobile && data.length > 8) {
        return (
          <Typography variant="caption" align="center" color="text.secondary">
            Mostrando 8 dos {data.length} itens
          </Typography>
        );
      }
      return null;
    }, [isMobile, data.length]);

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
          color="text.primary"
          align="center"
          gutterBottom
        >
          {title}
        </Typography>

        {truncatedDataMessage}

        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={chartMargin}
              barSize={barSize}
              layout={chartLayout}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />

              {/* Conditional axes based on layout */}
              {chartLayout === 'vertical' ? (
                <>
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{
                      fontSize: 10,
                      fill: chartColors.textPrimary,
                    }}
                    width={80}
                    stroke={chartColors.axis}
                  />
                  <XAxis
                    type="number"
                    tick={{
                      fontSize: 10,
                      fill: chartColors.textPrimary,
                    }}
                    tickFormatter={
                      stacked100 ? value => `${value}%` : undefined
                    }
                    stroke={chartColors.axis}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: isMobile ? 10 : 12,
                      fill: chartColors.textPrimary,
                    }}
                    interval={isMobile ? 1 : 0}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? 'end' : 'middle'}
                    height={isMobile ? 60 : 30}
                    stroke={chartColors.axis}
                  />
                  <YAxis
                    tick={{
                      fontSize: isMobile ? 10 : 12,
                      fill: chartColors.textPrimary,
                    }}
                    tickFormatter={
                      stacked100 ? value => `${value}%` : undefined
                    }
                    width={isMobile ? 30 : 40}
                    stroke={chartColors.axis}
                  />
                </>
              )}

              {/* Use our custom tooltip component */}
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: isDark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: isMobile ? 10 : 12,
                  color: chartColors.textPrimary,
                }}
                verticalAlign={isMobile ? 'top' : 'bottom'}
                height={36}
              />

              {themedSeries.map(s => (
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
  },
);

// Add display name for debugging
StackedBarChart.displayName = 'StackedBarChart';
