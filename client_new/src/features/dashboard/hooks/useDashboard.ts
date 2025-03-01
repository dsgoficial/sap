// Path: features\dashboard\hooks\useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../../../services/dashboardService';
import { DashboardData, DashboardSummary } from '../../../types/dashboard';

/**
 * Transform raw API data into dashboard-ready format
 */
const transformDashboardData = (
  data: Awaited<ReturnType<typeof getDashboardData>>
): DashboardData => {
  const { quantityData, finishedData, runningData, pitData } = data;
  
  // Calculate summary data
  const totalProducts = quantityData.reduce((sum, item) => sum + Number(item.quantidade), 0);
  const completedProducts = finishedData.reduce((sum, item) => sum + Number(item.finalizadas), 0);
  const runningProducts = runningData.reduce((sum, item) => sum + Number(item.count), 0);
  const progressPercentage = totalProducts ? (completedProducts / totalProducts) * 100 : 0;
  
  // Format lot progress data for stacked bar chart
  const lotProgressData = quantityData.map(item => {
    const completed = finishedData.find(f => f.lote === item.lote)?.finalizadas || 0;
    const running = runningData.find(r => r.lote === item.lote)?.count || 0;
    const notStarted = item.quantidade - (completed + running);
    
    return {
      name: item.lote,
      completed,
      running,
      notStarted
    };
  });
  
  // Format monthly data
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyData = months.map((monthName, idx) => {
    const monthNumber = idx + 1;
    const dataForMonth: Record<string, any> = { month: monthName };
    
    // Group by lot for stacked bar chart
    pitData.forEach(item => {
      if (item.month === monthNumber) {
        const lotKey = `lot_${item.lote}`;
        dataForMonth[lotKey] = (dataForMonth[lotKey] || 0) + item.finalizadas;
      }
    });
    
    return dataForMonth;
  });
  
  return {
    summary: {
      totalProducts,
      completedProducts,
      runningProducts,
      progressPercentage
    },
    lotProgressData,
    monthlyData
  };
};

/**
 * Hook to fetch and transform dashboard data
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    select: transformDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};