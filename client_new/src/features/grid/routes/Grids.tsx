// Path: features\grid\routes\Grids.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useGridStatistics } from '@/hooks/useGrid';
import { GridCard } from '../components/GridCard';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

export const Grids = () => {
  const { isAdmin } = useAuthStore();
  const { data, isLoading, error } = useGridStatistics();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <Page title="Grade de Acompanhamento">
        <Container maxWidth="xl" disableGutters>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
            width="100%"
          >
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Grade de Acompanhamento">
        <Container maxWidth="xl" disableGutters>
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            Erro ao carregar dados da grade. Por favor, tente novamente.
          </Alert>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Grade de Acompanhamento">
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Grade de Acompanhamento
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2,
            width: '100%',
          }}
        >
          {data &&
            data.map((grid, idx) => (
              <GridCard key={idx} id={idx} grid={grid} />
            ))}

          {data && data.length === 0 && (
            <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
              Nenhuma grade de acompanhamento disponível.
            </Alert>
          )}
        </Box>
      </Container>
    </Page>
  );
};
