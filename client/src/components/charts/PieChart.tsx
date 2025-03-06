// Path: components\charts\PieChart.tsx
import React, { useMemo, useCallback } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  Sector,
  TooltipProps,
} from 'recharts';
import { Typography, Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useChartColors } from './ChartThemeConfig';

interface PieChartDataPoint {
  label: string;
  value: number;
  color?: string; // Now optional as we'll use theme colors if not provided
}

interface PieChartProps {
  title: string;
  data: PieChartDataPoint[];
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

// Custom tooltip component with proper dark mode handling
const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<number, string> & { labelColors: string }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      {payload.map((entry, index) => (
        <div
          key={`item-${index}`}
          style={{ color: '#ffffff', margin: '2px 0' }}
        >
          <span style={{ display: 'inline-block', marginRight: '8px' }}>
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const PieChart = React.memo(
  ({
    title,
    data,
    height = 300,
    showLegend = true,
    showLabels = true,
  }: PieChartProps) => {
    const theme = useTheme();
    const chartColors = useChartColors();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isDarkMode = theme.palette.mode === 'dark';

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

    // Check if a single segment takes up almost all the chart (>95%)
    const hasDominantSegment = useMemo(() => {
      if (data.length === 0) return false;
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return data.some(item => item.value / total > 0.95);
    }, [data]);

    // Transform data for Recharts format - memoized
    const chartData = useMemo(
      () =>
        data.map(item => ({
          name: item.label,
          value: item.value,
        })),
      [data],
    );

    // Custom label renderer - simplified for mobile and handles 100% case
    const renderCustomizedLabel = useCallback(
      ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
        if (!showLabels) return null;

        // Don't show labels on mobile if too small
        if (isMobile && percent < 0.1) return null;

        // If we have a dominant segment, use a centered label instead of positioned labels
        if (hasDominantSegment && percent > 0.95) {
          return null; // We'll use a centered <Label> component instead
        }

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
      [showLabels, isMobile, hasDominantSegment],
    );

    // Active shape for tooltip hover
    const renderActiveShape = (props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
        props;
      return (
        <g>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 6}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
        </g>
      );
    };

    // Calculate optimal outer radius based on container size - memoized
    const outerRadius = useMemo(() => {
      if (isMobile) return '55%';
      if (isTablet) return '60%';
      return '70%';
    }, [isMobile, isTablet]);

    // Apply theme colors to data
    const themedData = useMemo(() => {
      return data.map((item, index) => ({
        ...item,
        color:
          item.color ||
          chartColors.seriesColors[index % chartColors.seriesColors.length],
      }));
    }, [data, chartColors.seriesColors]);

    // Legend style with proper type values
    const legendStyle = useMemo(
      () => ({
        wrapperStyle: {
          fontSize: isMobile ? 10 : 12,
          paddingTop: isMobile ? 5 : 10,
          color: chartColors.textPrimary,
        },
        layout: isMobile
          ? ('horizontal' as 'horizontal')
          : ('vertical' as 'vertical'),
        verticalAlign: isMobile
          ? ('bottom' as 'bottom')
          : ('middle' as 'middle'),
        align: isMobile ? ('center' as 'center') : ('right' as 'right'),
      }),
      [isMobile, chartColors],
    );

    // Find the dominant segment if it exists
    const dominantSegment = useMemo(() => {
      if (!hasDominantSegment || data.length === 0) return null;

      const total = data.reduce((sum, item) => sum + item.value, 0);
      return data.find(item => item.value / total > 0.95);
    }, [data, hasDominantSegment]);

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
                labelLine={showLabels && !isMobile && !hasDominantSegment}
                label={hasDominantSegment ? false : renderCustomizedLabel}
                outerRadius={outerRadius}
                activeShape={renderActiveShape}
                nameKey="name"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={themedData[index].color} />
                ))}

                {/* Special centered label for dominant segment case */}
                {hasDominantSegment && dominantSegment && (
                  <Label
                    position="center"
                    content={props => {
                      const { viewBox } = props;
                      const { cx, cy } = viewBox as { cx: number; cy: number };
                      return (
                        <g>
                          <text
                            x={cx}
                            y={cy - 15}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={16}
                            fill={theme.palette.text.primary}
                          >
                            {dominantSegment.label}
                          </text>
                          <text
                            x={cx}
                            y={cy + 15}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={18}
                            fontWeight="bold"
                            fill={theme.palette.text.primary}
                          >
                            {`100%`}
                          </text>
                        </g>
                      );
                    }}
                  />
                )}
              </Pie>
              {showLegend && (
                <Legend
                  wrapperStyle={{
                    ...legendStyle.wrapperStyle,
                    color: chartColors.textPrimary,
                  }}
                  layout={legendStyle.layout}
                  verticalAlign={legendStyle.verticalAlign}
                  align={legendStyle.align}
                />
              )}
              <Tooltip
                content={
                  <CustomTooltip
                    labelColors={isDarkMode ? '#ffffff' : '#000000'}
                  />
                }
              />
            </RechartsPie>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
  },
);

PieChart.displayName = 'PieChart';
