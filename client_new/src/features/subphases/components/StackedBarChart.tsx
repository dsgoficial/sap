// Path: features\subphases\components\StackedBarChart.tsx
import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ChartGroup, ChartPoint } from '../types';

interface StackedBarChartProps {
  data: ChartGroup;
}

// This is a simplified implementation
// In a real project, you'd use a proper charting library like recharts
// or implement the full canvas/d3 visualization
export const StackedBarChart = ({ data }: StackedBarChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize chart library or custom D3 implementation
    if (chartRef.current) {
      // Example implementation would initialize the chart here
      // For demonstration, we're just logging the data
      console.log('Chart data:', data);
      
      // In a real implementation, you would do:
      // const chart = new ChartLibrary({
      //   container: chartRef.current,
      //   title: data.title,
      //   data: [
      //     {
      //       type: "stackedBar100",
      //       color: "#9bbb59",
      //       name: "Finalizadas",
      //       showInLegend: true,
      //       dataPoints: data.dataPointA
      //     },
      //     {
      //       type: "stackedBar100",
      //       color: "#7f7f7f",
      //       name: "Não Finalizadas",
      //       showInLegend: true,
      //       dataPoints: data.dataPointB
      //     }
      //   ]
      // });
      // chart.render();
    }
  }, [data]);

  // Simplified rendering of the chart data as a table
  // In a real implementation, this would be the actual chart
  return (
    <Paper elevation={1} sx={{ p: 2, width: '100%', mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {data.title}
      </Typography>
      
      <Box sx={{ mt: 2 }} ref={chartRef}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Item</th>
              <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Finalizadas</th>
              <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Não Finalizadas</th>
            </tr>
          </thead>
          <tbody>
            {data.dataPointA.map((point, index) => (
              <tr key={index}>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{point.label}</td>
                <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{point.y}</td>
                <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                  {data.dataPointB[index] ? data.dataPointB[index].y : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

export default StackedBarChart;