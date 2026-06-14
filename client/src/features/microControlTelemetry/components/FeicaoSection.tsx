// Path: features\microControlTelemetry\components\FeicaoSection.tsx
import { useMemo } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { Table } from '@/components/ui/Table';
import { BarChart } from '@/components/charts/BarChart';
import { useFeicaoResumo } from '@/hooks/useMicroControlTelemetry';
import { MicroControlTelemetryFilters } from '@/types/microControlTelemetry';

interface FeicaoSectionProps {
  filters: MicroControlTelemetryFilters;
}

// Formata numeros com separador de milhar pt-BR (comprimento com 1 casa).
const formatInt = (value: number): string =>
  Number(value || 0).toLocaleString('pt-BR');

const formatLen = (value: number): string =>
  Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export const FeicaoSection = ({ filters }: FeicaoSectionProps) => {
  const { data, isLoading, error } = useFeicaoResumo(filters);

  // As seis colunas de metrica sao identicas em "Por operador" e "Por camada";
  // mudam so a primeira coluna (Operador vs Camada).
  const metricColumns = useMemo(
    () => [
      {
        id: 'insercoes',
        label: 'Inserções',
        align: 'right' as const,
        sortable: true,
        priority: 4,
        format: (v: number) => formatInt(v),
      },
      {
        id: 'delecoes',
        label: 'Deleções',
        align: 'right' as const,
        sortable: true,
        format: (v: number) => formatInt(v),
      },
      {
        id: 'atualizacoes_atributo',
        label: 'Atualizações atributo',
        align: 'right' as const,
        sortable: true,
        format: (v: number) => formatInt(v),
      },
      {
        id: 'atualizacoes_geometria',
        label: 'Atualizações geometria',
        align: 'right' as const,
        sortable: true,
        format: (v: number) => formatInt(v),
      },
      {
        id: 'comprimento',
        label: 'Comprimento',
        align: 'right' as const,
        sortable: true,
        format: (v: number) => formatLen(v),
      },
      {
        id: 'vertices',
        label: 'Vértices',
        align: 'right' as const,
        sortable: true,
        format: (v: number) => formatInt(v),
      },
    ],
    [],
  );

  const operatorColumns = useMemo(
    () => [
      { id: 'usuario', label: 'Operador', align: 'left' as const, sortable: true, priority: 5 },
      ...metricColumns,
    ],
    [metricColumns],
  );

  const camadaColumns = useMemo(
    () => [
      { id: 'camada', label: 'Camada', align: 'left' as const, sortable: true, priority: 5 },
      ...metricColumns,
    ],
    [metricColumns],
  );

  const serieSeries = useMemo(
    () => [
      { dataKey: 'insercoes', name: 'Inserções' },
      { dataKey: 'delecoes', name: 'Deleções' },
      { dataKey: 'atualizacoes_atributo', name: 'Atualizações atributo' },
      { dataKey: 'atualizacoes_geometria', name: 'Atualizações geometria' },
    ],
    [],
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Erro ao carregar o resumo de feição. Por favor, tente novamente.
      </Alert>
    );
  }

  const hasData =
    data &&
    (data.por_operador.length > 0 ||
      data.por_camada.length > 0 ||
      data.serie_diaria.length > 0);

  if (!hasData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Nenhum dado de feição para os filtros selecionados.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
      }}
    >
      {data.serie_diaria.length > 0 && (
        <BarChart
          title="Operações de feição por dia"
          data={data.serie_diaria}
          series={serieSeries}
          xAxisDataKey="dia"
          stacked
          height={360}
        />
      )}

      <Table
        title="Por operador"
        columns={operatorColumns}
        rows={data.por_operador}
        rowKey={row => row.usuario_id}
        searchPlaceholder="Buscar operador..."
        stickyHeader
        localization={{ emptyDataMessage: 'Nenhum operador no período.' }}
      />

      <Table
        title="Por camada"
        columns={camadaColumns}
        rows={data.por_camada}
        rowKey={row => row.camada}
        searchPlaceholder="Buscar camada..."
        stickyHeader
        localization={{ emptyDataMessage: 'Nenhuma camada no período.' }}
      />
    </Box>
  );
};
