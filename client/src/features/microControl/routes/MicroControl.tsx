// Path: features\microControl\routes\MicroControl.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useMicroControlData } from '@/hooks/useMicroControl';
import { Table } from '@/components/ui/Table';
import {
  FormattedRunningActivity,
  CompletedActivity,
} from '@/types/microControl';

export const MicroControl = () => {
  const {
    runningActivities,
    completedActivities,
    isLoadingRunning,
    isLoadingCompleted,
    errorRunning,
    errorCompleted,
  } = useMicroControlData();

  return (
    <Page title="Microcontrole">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Microcontrole
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          {/* Running Activities Table */}
          <Box>
            {isLoadingRunning ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : errorRunning ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Erro ao carregar atividades em execução. Por favor, tente
                novamente.
              </Alert>
            ) : runningActivities.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Não há atividades em execução no momento.
              </Alert>
            ) : (
              <Table<FormattedRunningActivity>
                title="Atividades em Execução"
                columns={[
                  {
                    id: 'projeto_nome',
                    label: 'Projeto',
                    align: 'left',
                    sortable: true,
                  },
                  { id: 'lote', label: 'Lote', align: 'left', sortable: true },
                  {
                    id: 'fase_nome',
                    label: 'Fase',
                    align: 'left',
                    sortable: true,
                  },
                  {
                    id: 'subfase_nome',
                    label: 'Subfase',
                    align: 'left',
                    sortable: true,
                  },
                  {
                    id: 'etapa_nome',
                    label: 'Etapa',
                    align: 'left',
                    sortable: true,
                  },
                  {
                    id: 'bloco',
                    label: 'Bloco',
                    align: 'left',
                    sortable: true,
                  },
                  {
                    id: 'atividade_id',
                    label: 'Atividade ID',
                    align: 'left',
                    sortable: true,
                  },
                  {
                    id: 'usuario',
                    label: 'Usuário',
                    align: 'left',
                    sortable: true,
                  },
                  {
                    id: 'data_inicio',
                    label: 'Data Início',
                    align: 'left',
                    sortable: true,
                  },
                  {
                    id: 'duration',
                    label: 'Duração',
                    align: 'left',
                    sortable: true,
                  },
                ]}
                rows={runningActivities}
                rowKey={row => row.atividade_id}
              />
            )}
          </Box>

          {/* Completed Activities Table */}
          <Box>
            {isLoadingCompleted ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : errorCompleted ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Erro ao carregar atividades finalizadas. Por favor, tente
                novamente.
              </Alert>
            ) : completedActivities.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Não há atividades finalizadas recentemente.
              </Alert>
            ) : (
              <Table<CompletedActivity>
                title="Últimas Atividades Finalizadas"
                columns={[
                  { id: 'projeto_nome', label: 'Projeto', align: 'left' },
                  { id: 'lote', label: 'Lote', align: 'left' },
                  { id: 'fase_nome', label: 'Fase', align: 'left' },
                  { id: 'subfase_nome', label: 'Subfase', align: 'left' },
                  { id: 'etapa_nome', label: 'Etapa', align: 'left' },
                  { id: 'bloco', label: 'Bloco', align: 'left' },
                  { id: 'atividade_id', label: 'Atividade ID', align: 'left' },
                  { id: 'usuario', label: 'Usuário', align: 'left' },
                  { id: 'data_inicio', label: 'Data Início', align: 'left' },
                  { id: 'data_fim', label: 'Data Fim', align: 'left' },
                ]}
                rows={completedActivities}
                rowKey={row => row.atividade_id}
              />
            )}
          </Box>
        </Box>
      </Container>
    </Page>
  );
};
