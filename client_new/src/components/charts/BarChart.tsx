// Path: components\charts\BarChart.tsx
import { useMemo } from 'react';
import { 
  BarChart as RechartsBar, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Typography, Paper, Box } from '@mui/material';

export interface BarChartSeries {
  dataKey: string;
  name: string;
  color: string;
}

export interface BarChartProps {
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
  stacked = false
}: BarChartProps) => {
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
          <RechartsBar
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisDataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            
            {series.map((s) => (
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