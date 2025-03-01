// Path: components\charts\BarChart.tsx
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

interface BarChartSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface BarChartProps {
  title: string;
  data: Array<Record<string, any>>;
  series: BarChartSeries[];
  xAxisDataKey: string;
  height?: number;
  stacked?: boolean;
}

export const BarChart = ({
  title,
  data,
  series,
  xAxisDataKey,
  height = 300,
  stacked = false,
}: BarChartProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Simplified data for mobile
  const displayData =
    isMobile && data.length > 10
      ? data.slice(Math.max(0, data.length - 6), data.length) // Show only last 6 items on mobile
      : data;

  // Simplified series for mobile
  const displaySeries =
    isMobile && series.length > 3
      ? series.slice(0, 3) // Show only first 3 series on mobile
      : series;

  // Calculate responsive height
  const responsiveHeight = isMobile
    ? Math.min(250, height)
    : isTablet
      ? Math.min(280, height)
      : height;

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

      {isMobile && data.length > 10 && (
        <Typography variant="caption" align="center" color="text.secondary">
          Mostrando os últimos 6 meses
        </Typography>
      )}

      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBar
            data={displayData}
            margin={{
              top: 20,
              right: isMobile ? 10 : 30,
              left: isMobile ? 0 : 20,
              bottom: 10,
            }}
            barSize={isMobile ? 10 : 20}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisDataKey}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? 1 : 0}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip
              wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              contentStyle={{ padding: isMobile ? 4 : 8 }}
            />
            <Legend
              wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
              verticalAlign={isMobile ? 'top' : 'bottom'}
              height={isMobile ? 20 : 36}
            />

            {displaySeries.map(s => (
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
};
