// Path: features\subphases\routes\Subphases.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useActivitySubphase } from '@/hooks/useSubphases';
import { TimelineVisualization } from '@/components/timeline/TimelineVisualization';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

export const Subphases = () => {
  const { isAdmin } = useAuthStore();
  const { data, isLoading, error } = useActivitySubphase();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <Page title="Atividade por Subfase">
        <Container>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Atividade por Subfase">
        <Container>
          <Alert severity="error" sx={{ mt: 2 }}>
            Erro ao carregar dados de atividades por subfase. Por favor, tente
            novamente.
          </Alert>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Atividade por Subfase">
      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Atividade por Subfase
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {data &&
            data.map((graph, idx) => (
              <Box
                key={idx}
                sx={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  height: '100%',
                  width: '100%',
                  borderRadius: '8px',
                }}
              >
                <TimelineVisualization
                  idContainer={graph.idContainer}
                  idBar={graph.idBar}
                  options={graph.options}
                  dataset={graph.dataset}
                />
              </Box>
            ))}

          {(!data || data.length === 0) && (
            <Alert severity="info">
              Nenhuma atividade por subfase disponível.
            </Alert>
          )}
        </Box>
      </Container>
    </Page>
  );
};
