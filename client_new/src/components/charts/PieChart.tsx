// Path: components\charts\PieChart.tsx
import React, { useMemo, useCallback } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Typography, Box, Paper, useTheme, useMediaQuery } from '@mui/material';

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

export const PieChart = React.memo(
  ({
    title,
    data,
    height = 300,
    showLegend = true,
    showLabels = true,
  }: PieChartProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Calculate responsive height - memoized
    const responsiveHeight = useMemo(
      () =>
        isMobile
          ? Math.min(250, height)
          : isTablet
            ? Math.min(280, height)
            : height,
      [isMobile, isTablet, height],
    );

    // Transform data for Recharts format - memoized
    const chartData = useMemo(
      () =>
        data.map(item => ({
          name: item.label,
          value: item.value,
        })),
      [data],
    );

    // Custom label renderer - simplified for mobile
    const renderCustomizedLabel = useCallback(
      ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
        if (!showLabels) return null;

        // Don't show labels on mobile if too small
        if (isMobile && percent < 0.1) return null;

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
            fontSize={isMobile ? 10 : 12}
          >
            {isMobile
              ? `${(percent * 100).toFixed(0)}%`
              : `${name}: ${(percent * 100).toFixed(0)}%`}
          </text>
        );
      },
      [showLabels, isMobile],
    );

    // Calculate optimal outer radius based on container size - memoized
    const outerRadius = useMemo(() => {
      if (isMobile) return '55%';
      if (isTablet) return '60%';
      return '70%';
    }, [isMobile, isTablet]);

    // Memoize tooltip and legend styles for consistent rendering
    const tooltipStyle = useMemo(
      () => ({
        wrapperStyle: { fontSize: isMobile ? 10 : 12 },
        contentStyle: { padding: isMobile ? 4 : 8 },
      }),
      [isMobile],
    );

    // Legend style with proper type values
    const legendStyle = useMemo(
      () => ({
        wrapperStyle: {
          fontSize: isMobile ? 10 : 12,
          paddingTop: isMobile ? 5 : 10,
        },
        layout: isMobile
          ? ('horizontal' as 'horizontal')
          : ('vertical' as 'vertical'),
        verticalAlign: isMobile
          ? ('bottom' as 'bottom')
          : ('middle' as 'middle'),
        align: isMobile ? ('center' as 'center') : ('right' as 'right'),
      }),
      [isMobile],
    );

    // Tooltip formatters - memoized
    const tooltipFormatters = useMemo(
      () => ({
        formatter: (value: number) => [`${value}`, 'Valor'],
        labelFormatter: (name: string) => `${name}`,
      }),
      [],
    );

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

        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                dataKey="value"
                isAnimationActive={true}
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={showLabels && !isMobile}
                label={renderCustomizedLabel}
                outerRadius={outerRadius}
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
              {showLegend && (
                <Legend
                  wrapperStyle={legendStyle.wrapperStyle}
                  layout={legendStyle.layout}
                  verticalAlign={legendStyle.verticalAlign}
                  align={legendStyle.align}
                />
              )}
              <Tooltip
                wrapperStyle={tooltipStyle.wrapperStyle}
                contentStyle={tooltipStyle.contentStyle}
                formatter={tooltipFormatters.formatter}
                labelFormatter={tooltipFormatters.labelFormatter}
              />
            </RechartsPie>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
  },
);

// Add display name for debugging
PieChart.displayName = 'PieChart';
