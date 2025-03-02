// Path: features\dashboard\routes\Dashboard.tsx
import { Container, Typography, Box, Alert } from '@mui/material';
import { StatusCards } from '../components/StatusCards';
import { ProductionCharts } from '../components/ProductionCharts';
import { useDashboard } from '@/hooks/useDashboard';

export const Dashboard = () => {
  const { data, isLoading, error } = useDashboard();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erro ao carregar dados do dashboard. Por favor, tente novamente.
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <StatusCards
          data={
            data?.summary || {
              totalProducts: 0,
              completedProducts: 0,
              runningProducts: 0,
              progressPercentage: 0,
            }
          }
          isLoading={isLoading}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <ProductionCharts data={data} isLoading={isLoading} />
      </Box>
    </Container>
  );
};
