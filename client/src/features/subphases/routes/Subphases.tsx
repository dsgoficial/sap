// Path: features\subphases\routes\Subphases.tsx
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
import { useActivitySubphase } from '@/hooks/useSubphases';
import { TimelineVisualization } from '@/components/timeline/TimelineVisualization';

export const Subphases = () => {
  // Removed redundant admin check - now handled by route loader
  const { data, isLoading, error } = useActivitySubphase();
  const theme = useTheme();

  if (isLoading) {
    return (
      <Page title="Atividade por Subfase">
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
      <Page title="Atividade por Subfase">
        <Container maxWidth="xl" disableGutters>
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
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Atividade por Subfase
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
          }}
        >
          {data &&
            data.map((graph, idx) => (
              <Paper
                key={idx}
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
                <TimelineVisualization
                  idContainer={graph.idContainer}
                  idBar={graph.idBar}
                  options={graph.options}
                  dataset={graph.dataset}
                />
              </Paper>
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
