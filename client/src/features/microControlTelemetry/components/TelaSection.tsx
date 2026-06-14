// Path: features\microControlTelemetry\components\TelaSection.tsx
import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import MapVisualization from '@/features/map/components/MapVisualization';
import { BarChart } from '@/components/charts/BarChart';
import {
  useTelaCobertura,
  useTelaAproveitamento,
} from '@/hooks/useMicroControlTelemetry';
import {
  MicroControlTelemetryFilters,
  TelaCoberturaProperties,
} from '@/types/microControlTelemetry';
import { MapLayer, LegendItem } from '@/types/map';

interface TelaSectionProps {
  filters: MicroControlTelemetryFilters;
}

const COBERTURA_LAYER_ID = 'microcontrole-tela-cobertura';

// Legenda minima da cobertura (a feicao usa a cor padrao do MapVisualization).
const COBERTURA_LEGEND: LegendItem[] = [
  {
    label: 'Extent amostrado da tela',
    color: '#4682B4',
    border: true,
  },
];

interface OperadorOption {
  usuario_id: number;
  usuario: string;
}

export const TelaSection = ({ filters }: TelaSectionProps) => {
  // Operador selecionado para a cobertura e o aproveitamento.
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  // A cobertura traz todos os operadores do periodo (sem filtro de operador),
  // para o seletor nao colapsar; a selecao filtra o mapa no cliente.
  const {
    data: cobertura,
    isLoading: isLoadingCobertura,
    error: errorCobertura,
  } = useTelaCobertura(filters);

  const {
    data: aproveitamento,
    isLoading: isLoadingAproveitamento,
    error: errorAproveitamento,
  } = useTelaAproveitamento(usuarioId, filters);

  // Lista de operadores presentes na cobertura (para o seletor).
  const operadores = useMemo<OperadorOption[]>(() => {
    if (!cobertura) return [];
    const map = new Map<number, string>();
    cobertura.features.forEach(f => {
      const props = f.properties as TelaCoberturaProperties | null;
      if (props && props.usuario_id != null) {
        map.set(props.usuario_id, props.usuario || `Operador ${props.usuario_id}`);
      }
    });
    return Array.from(map.entries())
      .map(([id, usuario]) => ({ usuario_id: id, usuario }))
      .sort((a, b) => a.usuario.localeCompare(b.usuario));
  }, [cobertura]);

  // Envolve a cobertura em uma camada do MapVisualization, filtrando pelo
  // operador selecionado no cliente (a cobertura ja veio com todos).
  const layers = useMemo<MapLayer[]>(() => {
    if (!cobertura) return [];
    const features =
      usuarioId == null
        ? cobertura.features
        : cobertura.features.filter(
            f =>
              (f.properties as TelaCoberturaProperties | null)?.usuario_id ===
              usuarioId,
          );
    if (features.length === 0) return [];
    return [
      {
        id: COBERTURA_LAYER_ID,
        name: 'Cobertura de tela',
        geojson: { ...cobertura, features } as GeoJSON.FeatureCollection,
        visible: true,
      },
    ];
  }, [cobertura, usuarioId]);

  const visibleLayers = useMemo(
    () => ({ [COBERTURA_LAYER_ID]: true }),
    [],
  );

  // O MapVisualization espera um handler de toggle; mantemos a unica camada
  // sempre visivel (sem painel de controle util aqui, mas a assinatura exige).
  const handleToggleLayer = useCallback(() => {}, []);

  const aproveitamentoSeries = useMemo(
    () => [{ dataKey: 'aproveitamento_pct', name: 'Aproveitamento (%)' }],
    [],
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
      }}
    >
      {/* Seletor de operador */}
      <TextField
        select
        label="Operador"
        value={usuarioId ?? ''}
        onChange={e =>
          setUsuarioId(e.target.value === '' ? null : Number(e.target.value))
        }
        sx={{ maxWidth: 360 }}
        size="small"
        helperText="Selecione um operador para ver o aproveitamento diário"
      >
        <MenuItem value="">Todos os operadores</MenuItem>
        {operadores.map(op => (
          <MenuItem key={op.usuario_id} value={op.usuario_id}>
            {op.usuario}
          </MenuItem>
        ))}
      </TextField>

      {/* Mapa da cobertura de tela */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Cobertura de tela
        </Typography>

        {cobertura?.aviso && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {cobertura.aviso}
          </Alert>
        )}

        {isLoadingCobertura ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : errorCobertura ? (
          <Alert severity="error">
            Erro ao carregar a cobertura de tela. Por favor, tente novamente.
          </Alert>
        ) : layers.length === 0 ? (
          <Alert severity="info">
            Nenhuma cobertura de tela para os filtros selecionados.
          </Alert>
        ) : (
          <MapVisualization
            layers={layers}
            legendItems={COBERTURA_LEGEND}
            visibleLayers={visibleLayers}
            onToggleLayer={handleToggleLayer}
          />
        )}
      </Box>

      {/* Aproveitamento do operador selecionado */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Aproveitamento diário
        </Typography>

        {usuarioId === null ? (
          <Alert severity="info">
            Selecione um operador para ver o aproveitamento diário.
          </Alert>
        ) : isLoadingAproveitamento ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : errorAproveitamento ? (
          <Alert severity="error">
            Erro ao carregar o aproveitamento. Por favor, tente novamente.
          </Alert>
        ) : aproveitamento.length === 0 ? (
          <Alert severity="info">
            Nenhum dado de aproveitamento para o operador selecionado.
          </Alert>
        ) : (
          <BarChart
            title="Aproveitamento por dia (%)"
            data={aproveitamento}
            series={aproveitamentoSeries}
            xAxisDataKey="dia"
            height={320}
          />
        )}
      </Box>
    </Box>
  );
};
