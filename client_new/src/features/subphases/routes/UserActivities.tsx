// Path: features\subphases\routes\UserActivities.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useUserActivities } from '@/hooks/useSubphases';
import { TimelineVisualization } from '@/components/timeline/TimelineVisualization';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

export const UserActivities = () => {
  const { isAdmin } = useAuthStore();
  const { data, isLoading, error } = useUserActivities();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <Page title="Atividades por Usuário">
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
      <Page title="Atividades por Usuário">
        <Container>
          <Alert severity="error" sx={{ mt: 2 }}>
            Erro ao carregar dados de atividades por usuário. Por favor, tente
            novamente.
          </Alert>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Atividades por Usuário">
      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Atividades por Usuário
        </Typography>

        <Box
          sx={{
            backgroundColor: '#fff',
            padding: '20px',
            height: '100%',
            width: '100%',
            borderRadius: '8px',
          }}
        >
          {data &&
            data.map((graph, idx) => (
              <TimelineVisualization
                key={idx}
                idContainer={graph.idContainer}
                idBar={graph.idBar}
                options={graph.options}
                dataset={graph.dataset}
              />
            ))}

          {(!data || data.length === 0) && (
            <Alert severity="info">
              Nenhuma atividade por usuário disponível.
            </Alert>
          )}
        </Box>
      </Container>
    </Page>
  );
};
