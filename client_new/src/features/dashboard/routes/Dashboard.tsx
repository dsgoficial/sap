// Path: features\dashboard\routes\Dashboard.tsx
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { StatusCards } from '../components/StatusCards';
import { ProductionCharts } from '../components/ProductionCharts';
import { useLoaderData } from 'react-router-dom';
import { getDashboardData } from '@/services/dashboardService';
import { DashboardData } from '@/types/dashboard';
import { transformDashboardData } from '@/hooks/useDashboard';

// Interface for loader data
interface DashboardLoaderData {
  dashboardData?: DashboardData;
  error?: boolean;
  message?: string;
}

// Dashboard loader function - will be referenced in the router config
export async function dashboardLoader() {
  try {
    const rawData = await getDashboardData();
    const dashboardData = transformDashboardData(rawData);

    return { dashboardData };
  } catch (error) {
    // Return error state that the component can handle
    return {
      error: true,
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export const Dashboard = () => {
  // Use the React Router v7 hook to access loader data
  const { dashboardData, error, message } =
    useLoaderData() as DashboardLoaderData;

  // Check if data contains an error
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar dados do dashboard: {message || 'Tente novamente.'}
        </Alert>
      </Container>
    );
  }

  // If we're still waiting for data but no error
  if (!dashboardData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Box sx={{ mt: 3 }}>
        <StatusCards data={dashboardData.summary} isLoading={false} />
      </Box>

      <Box sx={{ mt: 3 }}>
        <ProductionCharts data={dashboardData} isLoading={false} />
      </Box>
    </Container>
  );
};
