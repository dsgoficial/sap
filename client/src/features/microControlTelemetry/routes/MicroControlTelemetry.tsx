// Path: features\microControlTelemetry\routes\MicroControlTelemetry.tsx
import { useMemo, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useLotesOptions } from '@/hooks/useMicroControlTelemetry';
import { MicroControlTelemetryFilters } from '@/types/microControlTelemetry';
import { FeicaoSection } from '../components/FeicaoSection';
import { TelaSection } from '../components/TelaSection';

// Data ISO (YYYY-MM-DD) de hoje e de N dias atras, para os filtros padrao.
const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

const defaultDataFim = isoDate(new Date());
const defaultDataInicio = isoDate(
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
);

export const MicroControlTelemetry = () => {
  const [tab, setTab] = useState(0);
  const [loteId, setLoteId] = useState<number | null>(null);
  const [dataInicio, setDataInicio] = useState<string>(defaultDataInicio);
  const [dataFim, setDataFim] = useState<string>(defaultDataFim);

  const { lotes } = useLotesOptions();

  const filters = useMemo<MicroControlTelemetryFilters>(
    () => ({
      lote_id: loteId,
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    }),
    [loteId, dataInicio, dataFim],
  );

  return (
    <Page title="Microcontrole">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Microcontrole
        </Typography>

        {/* Barra de filtros */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              select
              label="Lote"
              value={loteId ?? ''}
              onChange={e =>
                setLoteId(
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              size="small"
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Todos os lotes</MenuItem>
              {lotes.map(lote => (
                <MenuItem key={lote.id} value={lote.id}>
                  {lote.nome}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data início"
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Data fim"
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Paper>

        {/* Abas Feição / Tela */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_e, value) => setTab(value)}
            aria-label="Seções do microcontrole"
          >
            <Tab label="Feição" id="microcontrole-tab-feicao" />
            <Tab label="Tela" id="microcontrole-tab-tela" />
          </Tabs>
        </Box>

        {tab === 0 && <FeicaoSection filters={filters} />}
        {tab === 1 && <TelaSection filters={filters} />}
      </Container>
    </Page>
  );
};
