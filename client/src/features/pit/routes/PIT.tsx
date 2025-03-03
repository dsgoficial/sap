// Path: features\pit\routes\PIT.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { usePITData, PitViewModel } from '@/hooks/usePIT';
import { Table } from '@/components/ui/Table';

// Month definitions with correct types
const MONTHS = [
  { label: 'Jan', id: 'jan' },
  { label: 'Fev', id: 'fev' },
  { label: 'Mar', id: 'mar' },
  { label: 'Abr', id: 'abr' },
  { label: 'Mai', id: 'mai' },
  { label: 'Jun', id: 'jun' },
  { label: 'Jul', id: 'jul' },
  { label: 'Ago', id: 'ago' },
  { label: 'Set', id: 'set' },
  { label: 'Out', id: 'out' },
  { label: 'Nov', id: 'nov' },
  { label: 'Dez', id: 'dez' },
];

export const PIT = () => {
  // Fixed type issues with data from hook
  const { data, isLoading, error } = usePITData();

  if (isLoading) {
    return (
      <Page title="PIT">
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
      <Page title="PIT">
        <Container maxWidth="xl" disableGutters>
          <Alert severity="error" sx={{ mt: 2 }}>
            Erro ao carregar dados de PIT. Por favor, tente novamente.
          </Alert>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="PIT">
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" sx={{ mb: 3 }}>
          PIT
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            width: '100%',
          }}
        >
          {data &&
            data.map((item: PitViewModel, idx: number) => (
              <Box key={idx} sx={{ width: '100%' }}>
                <Table
                  title={item.project}
                  columns={[
                    { id: 'lot', label: 'Lote', align: 'left' },
                    {
                      id: 'meta',
                      label: 'Meta',
                      align: 'center' as 'center',
                      minWidth: 70,
                    },
                    ...MONTHS.map(m => ({
                      id: m.id,
                      label: m.label,
                      align: 'center' as 'center',
                      minWidth: 50,
                      maxWidth: 70,
                    })),
                    {
                      id: 'count',
                      label: 'Quantitativo',
                      align: 'center' as 'center',
                      minWidth: 100,
                    },
                    {
                      id: 'percent',
                      label: '(%)',
                      align: 'center' as 'center',
                      minWidth: 80,
                    },
                  ]}
                  rows={item.rows}
                  rowKey={row => `${item.project}-${row.lot}`}
                />
              </Box>
            ))}

          {data && data.length === 0 && (
            <Alert severity="info">Nenhum dado de PIT disponível.</Alert>
          )}
        </Box>
      </Container>
    </Page>
  );
};
