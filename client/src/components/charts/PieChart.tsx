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
  bgColor,
  textColor,
}: TooltipProps<number, string> & { bgColor: string; textColor: string }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: '8px 12px',
        border: `1px solid ${textColor}33`,
        borderRadius: '4px',
      }}
    >
      {payload.map((entry, index) => {
        const pct = (entry as { percent?: number }).percent;
        const percentText =
          typeof pct === 'number' ? ` (${(pct * 100).toFixed(0)}%)` : '';
        return (
          <div
            key={String(entry.name ?? entry.dataKey ?? index)}
            style={{ color: textColor, margin: '2px 0' }}
          >
            <span style={{ display: 'inline-block', marginRight: '8px' }}>
              {entry.name}: {entry.value}
              {percentText}
            </span>
          </div>
        );
      })}
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

    // Soma total dos valores (memoizada) — base para % e empty-state.
    const total = useMemo(
      () => data.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
      [data],
    );

    // Sem dados quando não há itens OU todos somam zero (evita 0/0 = NaN%).
    const hasData = data.length > 0 && total > 0;

    // Check if a single segment takes up almost all the chart (>95%)
    const hasDominantSegment = useMemo(() => {
      if (!hasData) return false;
      return data.some(item => item.value / total > 0.95);
    }, [data, hasData, total]);

    // Transform data for Recharts format — cor já embutida (fonte única).
    const chartData = useMemo(
      () =>
        data.map((item, index) => ({
          name: item.label,
          value: item.value,
          color:
            item.color ||
            chartColors.seriesColors[index % chartColors.seriesColors.length],
        })),
      [data, chartColors.seriesColors],
    );

    // Custom label renderer - simplified for mobile and handles 100% case
    const renderCustomizedLabel = useCallback(
      ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
        if (!showLabels) return null;

        // Sem percentual válido (ex.: todos os valores 0) — não renderiza label.
        if (typeof percent !== 'number' || Number.isNaN(percent)) return null;

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

    // Legend style with proper type values
    const legendStyle = useMemo(
      () => ({
        wrapperStyle: {
          fontSize: isMobile ? 10 : 12,
          paddingTop: isMobile ? 5 : 10,
          color: chartColors.textPrimary,
        },
        layout: isMobile ? ('horizontal' as const) : ('vertical' as const),
        verticalAlign: isMobile ? ('bottom' as const) : ('middle' as const),
        align: isMobile ? ('center' as const) : ('right' as const),
      }),
      [isMobile, chartColors],
    );

    // Find the dominant segment if it exists
    const dominantSegment = useMemo(() => {
      if (!hasDominantSegment) return null;
      return data.find(item => item.value / total > 0.95);
    }, [data, hasDominantSegment, total]);

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
          {!hasData ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Sem dados disponíveis
              </Typography>
            </Box>
          ) : (
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
                  {chartData.map(entry => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}

                  {/* Special centered label for dominant segment case */}
                  {hasDominantSegment && dominantSegment && (
                    <Label
                      position="center"
                      content={props => {
                        const { viewBox } = props;
                        const { cx, cy } = viewBox as {
                          cx: number;
                          cy: number;
                        };
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
                      bgColor={chartColors.paper}
                      textColor={chartColors.textPrimary}
                    />
                  }
                />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </Box>
      </Paper>
    );
  },
);

PieChart.displayName = 'PieChart';
