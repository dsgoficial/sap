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

// --- Contraste de rótulo -----------------------------------------------------
// O texto sobre uma fatia precisa contrastar com QUALQUER cor de fatia (clara ou
// escura), em light e dark. Em vez de fixar branco (ilegível sobre amarelo/ciano/
// verde), calculamos a luminância da fatia e escolhemos tinta clara ou escura.
const hexToRgb = (hex: string): [number, number, number] | null => {
  let h = hex.trim().replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  if (h.length !== 6) return null;
  const num = Number.parseInt(h, 16);
  if (Number.isNaN(num)) return null;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const relLuminance = ([r, g, b]: [number, number, number]) => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrastRatio = (l1: number, l2: number) =>
  (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

// Tinta (escura ou clara) com melhor contraste sobre a cor de fundo `bg`.
const readableInk = (bg: string, darkInk = '#212B36', lightInk = '#FFFFFF') => {
  const rgb = hexToRgb(bg);
  if (!rgb) return lightInk;
  const lBg = relLuminance(rgb);
  const lDark = relLuminance(hexToRgb(darkInk)!);
  const lLight = relLuminance(hexToRgb(lightInk)!);
  return contrastRatio(lBg, lDark) >= contrastRatio(lBg, lLight)
    ? darkInk
    : lightInk;
};

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
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
      }}
    >
      {payload.map((entry, index) => {
        const pct = (entry as { percent?: number }).percent;
        const percentText =
          typeof pct === 'number' ? ` (${(pct * 100).toFixed(0)}%)` : '';
        const swatch =
          (entry.payload as { color?: string } | undefined)?.color ??
          (entry.color as string | undefined);
        return (
          <div
            key={String(entry.name ?? entry.dataKey ?? index)}
            style={{
              color: textColor,
              margin: '2px 0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {swatch && (
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: swatch,
                  marginRight: 8,
                  flexShrink: 0,
                }}
              />
            )}
            <span>
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

    // Rótulo interno = SÓ a porcentagem (curto, cabe na fatia), com tinta de
    // contraste calculada por fatia. O nome fica na legenda (identidade nunca é
    // só cor). Fatias finas não recebem rótulo para não sobrepor/estourar.
    const renderCustomizedLabel = useCallback(
      ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
        fill,
      }: any) => {
        if (!showLabels) return null;

        // Sem percentual válido (ex.: todos os valores 0) — não renderiza label.
        if (typeof percent !== 'number' || Number.isNaN(percent)) return null;

        // Esconde rótulos de fatias muito finas (evita colisão/estouro).
        const minPct = isMobile ? 0.08 : 0.05;
        if (percent < minPct) return null;

        // Fatia dominante usa o rótulo central do donut, não o interno.
        if (hasDominantSegment && percent > 0.95) return null;

        const RADIAN = Math.PI / 180;
        // Meio do anel do donut — banda consistente para todos os rótulos.
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const sliceColor =
          fill || chartData[index]?.color || chartColors.seriesColors[0];

        return (
          <text
            x={x}
            y={y}
            fill={readableInk(sliceColor)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={isMobile ? 11 : 13}
            fontWeight={600}
            style={{ pointerEvents: 'none' }}
          >
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        );
      },
      [
        showLabels,
        isMobile,
        hasDominantSegment,
        chartData,
        chartColors.seriesColors,
      ],
    );

    // Active shape for tooltip hover
    const renderActiveShape = (props: any) => {
      const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
      } = props;
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

    // Raios do donut (anel) por breakpoint — memoizados. O furo central abre
    // espaço para o total e dá uma banda uniforme aos rótulos.
    const radii = useMemo(() => {
      if (isMobile) return { inner: '38%', outer: '60%' };
      if (isTablet) return { inner: '40%', outer: '64%' };
      return { inner: '46%', outer: '72%' };
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

    // Rótulo central do donut: total (ou 100% + nome quando há fatia dominante).
    const renderCenterLabel = useCallback(
      (props: any) => {
        const { viewBox } = props;
        const { cx, cy } = viewBox as { cx: number; cy: number };
        const bigText = hasDominantSegment
          ? '100%'
          : total.toLocaleString('pt-BR');
        const smallText =
          hasDominantSegment && dominantSegment
            ? dominantSegment.label
            : 'Total';
        return (
          <g style={{ pointerEvents: 'none' }}>
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isMobile ? 20 : 24}
              fontWeight={700}
              fill={chartColors.textPrimary}
            >
              {bigText}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={isMobile ? 10 : 12}
              fill={chartColors.textSecondary}
            >
              {smallText}
            </text>
          </g>
        );
      },
      [hasDominantSegment, dominantSegment, total, isMobile, chartColors],
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
                  innerRadius={radii.inner}
                  outerRadius={radii.outer}
                  paddingAngle={chartData.length > 1 ? 2 : 0}
                  stroke={chartColors.paper}
                  strokeWidth={2}
                  labelLine={false}
                  label={renderCustomizedLabel}
                  activeShape={renderActiveShape}
                  nameKey="name"
                >
                  {chartData.map(entry => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}

                  {/* Rótulo central do donut (total ou fatia dominante). */}
                  <Label position="center" content={renderCenterLabel} />
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
