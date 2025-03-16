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
import { useDashboard } from '@/hooks/useDashboard';

export const Dashboard = () => {
  const { dashboardData, isLoading, isError, error } = useDashboard();

  // Show loading state
  if (isLoading) {
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

  // Show error state
  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar dados do dashboard:{' '}
          {error?.message || 'Tente novamente.'}
        </Alert>
      </Container>
    );
  }

  // If no data but no error either
  if (!dashboardData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Nenhum dado disponível para exibição.
        </Alert>
      </Container>
    );
  }

  // Render dashboard with data
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
