// Path: components\charts\BarChart.tsx
import React, { useMemo } from 'react';
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Typography, Paper, Box, useTheme, useMediaQuery } from '@mui/material';
import { useChartColors } from './ChartThemeConfig';

interface BarChartSeries {
  dataKey: string;
  name: string;
  color?: string; // Now optional as we'll use theme colors if not provided
}

interface BarChartProps {
  title: string;
  data: Array<Record<string, any>>;
  series: BarChartSeries[];
  xAxisDataKey: string;
  height?: number;
  stacked?: boolean;
}

export const BarChart = React.memo(
  ({
    title,
    data,
    series,
    xAxisDataKey,
    height = 300,
    stacked = false,
  }: BarChartProps) => {
    const theme = useTheme();
    const chartColors = useChartColors();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const displayData = useMemo(
      () =>
        isMobile && data.length > 10
          ? data.slice(Math.max(0, data.length - 6), data.length) // Show only last 6 items on mobile
          : data,
      [isMobile, data],
    );

    const displaySeries = useMemo(
      () =>
        isMobile && series.length > 3
          ? series.slice(0, 3) // Show only first 3 series on mobile
          : series,
      [isMobile, series],
    );

    const responsiveHeight = useMemo(
      () =>
        isMobile
          ? Math.min(250, height)
          : isTablet
            ? Math.min(280, height)
            : height,
      [isMobile, isTablet, height],
    );

    const chartMargins = useMemo(
      () => ({
        top: 20,
        right: isMobile ? 10 : 30,
        left: isMobile ? 0 : 20,
        bottom: 10,
      }),
      [isMobile],
    );

    const barSize = useMemo(() => (isMobile ? 10 : 20), [isMobile]);

    const truncatedDataMessage = useMemo(() => {
      if (isMobile && data.length > 10) {
        return (
          <Typography variant="caption" align="center" color="text.secondary">
            Mostrando os últimos 6 meses
          </Typography>
        );
      }
      return null;
    }, [isMobile, data.length]);

    const themedSeries = useMemo(() => {
      return displaySeries.map((s, index) => ({
        ...s,
        color:
          s.color ||
          chartColors.seriesColors[index % chartColors.seriesColors.length],
      }));
    }, [displaySeries, chartColors.seriesColors]);

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

        {truncatedDataMessage}

        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBar
              data={displayData}
              margin={chartMargins}
              barSize={barSize}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey={xAxisDataKey}
                tick={{
                  fontSize: isMobile ? 10 : 12,
                  fill: chartColors.textPrimary,
                }}
                interval={isMobile ? 1 : 0}
                stroke={chartColors.axis}
              />
              <YAxis
                tick={{
                  fontSize: isMobile ? 10 : 12,
                  fill: chartColors.textPrimary,
                }}
                width={isMobile ? 30 : 40}
                stroke={chartColors.axis}
              />
              <Tooltip
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                contentStyle={{
                  padding: isMobile ? 4 : 8,
                  backgroundColor: chartColors.paper,
                  color: chartColors.textPrimary,
                  border: `1px solid ${chartColors.grid}`,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                verticalAlign={isMobile ? 'top' : 'bottom'}
                height={isMobile ? 20 : 36}
              />

              {themedSeries.map(s => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.color}
                  stackId={stacked ? 'stack' : undefined}
                />
              ))}
            </RechartsBar>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
  },
);

BarChart.displayName = 'BarChart';
