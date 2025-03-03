// Path: features\subphases\routes\UserActivities.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useUserActivities } from '@/hooks/useSubphases';
import { TimelineVisualization } from '@/components/timeline/TimelineVisualization';

export const UserActivities = () => {
  // Removed redundant admin check - now handled by route loader
  const { data, isLoading, error } = useUserActivities();
  const theme = useTheme();

  if (isLoading) {
    return (
      <Page title="Atividades por Usuário">
        <Container maxWidth="xl" disableGutters>
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
        <Container maxWidth="xl" disableGutters>
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
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Atividades por Usuário
        </Typography>

        <Paper
          elevation={2}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            overflow: 'hidden',
            transition: theme.transitions.create(
              ['background-color', 'box-shadow'],
              {
                duration: theme.transitions.duration.standard,
              },
            ),
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
        </Paper>
      </Container>
    </Page>
  );
};
