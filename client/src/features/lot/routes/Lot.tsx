// Path: features\lot\routes\Lot.tsx
import { useMemo } from 'react';
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
  const { data, isLoading, error } = useLotData();

  const columns = useMemo(() => [
    {
      id: 'subphase',
      label: 'Subfase',
      align: 'left' as const,
      sortable: true,
      priority: 5,
    },
    ...MONTHS.map(m => ({
      id: m.id,
      label: m.label,
      align: 'center' as const,
      minWidth: 50,
      maxWidth: 70,
      priority: 3,
    })),
  ], []);

  // Loading state
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

  // Error state
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
            gap: 3,
            width: '100%',
          }}
        >
          {data &&
            data.map((item: LotViewModel, idx: number) => (
              <Box
                key={`${item.lot}-${idx}`}
                sx={{
                  width: '100%',
                }}
              >
                <Table
                  title={item.lot}
                  columns={columns}
                  rows={item.rows}
                  rowKey={row => `${item.lot}-${row.subphase}`}
                  searchPlaceholder="Buscar subfase..."
                  stickyHeader={true}
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

          {(!data || data.length === 0) && (
            <Alert severity="info">Nenhum dado de lote disponível.</Alert>
          )}
        </Box>
      </Container>
    </Page>
  );
};