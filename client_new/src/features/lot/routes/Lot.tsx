// Path: features\lot\routes\Lot.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useLotData, LotViewModel } from '@/hooks/useLot';
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

export const Lot = () => {
  // Get data from the hook - now properly typed
  const { data, isLoading, error } = useLotData();

  if (isLoading) {
    return (
      <Page title="Acompanhamento Lote">
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
      <Page title="Acompanhamento Lote">
        <Container maxWidth="xl" disableGutters>
          <Alert severity="error" sx={{ mt: 2 }}>
            Erro ao carregar dados de lotes. Por favor, tente novamente.
          </Alert>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Acompanhamento Lote">
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Acompanhamento Lote
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
            data.map((item: LotViewModel, idx: number) => (
              <Box
                key={idx}
                sx={{
                  width: '100%',
                }}
              >
                <Table
                  title={item.lot}
                  columns={[
                    {
                      id: 'subphase',
                      label: 'Subfase',
                      align: 'left',
                      sortable: true,
                    },
                    ...MONTHS.map(m => ({
                      id: m.id,
                      label: m.label,
                      align: 'center' as 'center',
                      minWidth: 50,
                      maxWidth: 70,
                    })),
                  ]}
                  rows={item.rows}
                  rowKey={row => `${item.lot}-${row.subphase}`}
                  searchPlaceholder="Buscar subfase..."
                  localization={{
                    emptyDataMessage: 'Nenhum dado de lote disponível.',
                    searchPlaceholder: 'Buscar subfase...',
                    pagination: {
                      labelRowsPerPage: 'Registros por página',
                      of: 'de',
                      firstPage: 'Primeira página',
                      previousPage: 'Página anterior',
                      nextPage: 'Próxima página',
                      lastPage: 'Última página',
                    },
                  }}
                />
              </Box>
            ))}

          {data && data.length === 0 && (
            <Alert severity="info">Nenhum dado de lote disponível.</Alert>
          )}
        </Box>
      </Container>
    </Page>
  );
};
