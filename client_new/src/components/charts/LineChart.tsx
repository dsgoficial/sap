// Path: components\charts\LineChart.tsx
import { useMemo } from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Typography, Paper, Box } from '@mui/material';

export interface LineChartSeries {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
  dot?: boolean;
}

export interface LineChartProps {
  title: string;
  data: Array<Record<string, any>>;
  series: LineChartSeries[];
  xAxisDataKey: string;
  height?: number;
  yAxisLabel?: string;
  xAxisLabel?: string;
  grid?: boolean;
}

export const LineChart = ({
  title,
  data,
  series,
  xAxisDataKey,
  height = 300,
  yAxisLabel,
  xAxisLabel,
  grid = true
}: LineChartProps) => {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        width: '100%', 
        height, 
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>
      
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10
            }}
          >
            {grid && <CartesianGrid strokeDasharray="3 3" />}
            
            <XAxis 
              dataKey={xAxisDataKey} 
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottomRight', offset: -10 } : undefined}
            />
            
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            
            <Tooltip />
            <Legend />
            
            {series.map((s) => (
              <Line 
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey} 
                name={s.name} 
                stroke={s.color}
                strokeWidth={s.strokeWidth || 2}
                dot={s.dot !== false}
                activeDot={{ r: 8 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};