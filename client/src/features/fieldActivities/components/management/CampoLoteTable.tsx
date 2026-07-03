// Path: features\fieldActivities\components\management\CampoLoteTable.tsx
import { useMemo } from 'react';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Table } from '@/components/ui/Table';
import { useCampos, useProdutosCampoTodos } from '@/hooks/useFieldManagement';

interface CampoLoteRow {
  id: string;
  nome: string;
  orgao?: string;
  pit?: number;
  situacao?: string;
  lotes: string; // nomes dos lotes, unidos por ", " (facilita a busca da tabela)
  lotesCount: number;
  qtdProdutos: number;
  produtosPorLote: Record<string, string[]>;
}

export const CampoLoteTable = () => {
  const { data: campos = [], isLoading: isLoadingCampos } = useCampos();
  const { data: associacoes = [], isLoading: isLoadingAssociacoes } =
    useProdutosCampoTodos();

  const rows = useMemo<CampoLoteRow[]>(() => {
    const porCampo = new Map<
      string,
      { lotes: Set<string>; produtosPorLote: Record<string, string[]> }
    >();

    associacoes.forEach(a => {
      if (!porCampo.has(a.campo_id)) {
        porCampo.set(a.campo_id, { lotes: new Set(), produtosPorLote: {} });
      }
      const entry = porCampo.get(a.campo_id)!;
      entry.lotes.add(a.nome_lote);
      if (!entry.produtosPorLote[a.nome_lote]) {
        entry.produtosPorLote[a.nome_lote] = [];
      }
      entry.produtosPorLote[a.nome_lote].push(a.produto_nome);
    });

    return campos.map(campo => {
      const info = porCampo.get(campo.id);
      const lotesOrdenados = info ? Array.from(info.lotes).sort() : [];
      const qtdProdutos = info
        ? Object.values(info.produtosPorLote).reduce(
            (soma, produtos) => soma + produtos.length,
            0,
          )
        : 0;

      return {
        id: campo.id,
        nome: campo.nome,
        orgao: campo.orgao,
        pit: campo.pit,
        situacao: campo.situacao,
        lotes: lotesOrdenados.join(', '),
        lotesCount: lotesOrdenados.length,
        qtdProdutos,
        produtosPorLote: info?.produtosPorLote ?? {},
      };
    });
  }, [campos, associacoes]);

  const semLote = useMemo(
    () => rows.filter(r => r.lotesCount === 0).length,
    [rows],
  );
  const multiplosLotes = useMemo(
    () => rows.filter(r => r.lotesCount > 1).length,
    [rows],
  );

  const columns = useMemo(
    () => [
      { id: 'nome', label: 'Campo', align: 'left' as const, sortable: true },
      {
        id: 'orgao',
        label: 'Órgão',
        align: 'left' as const,
        sortable: true,
        format: (value: string) => value || '—',
      },
      {
        id: 'pit',
        label: 'PIT',
        align: 'center' as const,
        sortable: true,
        format: (value: number) => value || '—',
      },
      {
        id: 'situacao',
        label: 'Situação',
        align: 'center' as const,
        sortable: true,
        format: (value: string) => (
          <Chip label={value || '—'} size="small" variant="outlined" />
        ),
      },
      {
        id: 'lotes',
        label: 'Lote(s) de Produtos',
        align: 'left' as const,
        sortable: true,
        minWidth: 260,
        format: (value: string, row: CampoLoteRow) => {
          if (!value) {
            return (
              <Chip
                label="Sem produto associado"
                size="small"
                color="warning"
                variant="outlined"
              />
            );
          }
          const lotes = value.split(', ');
          return (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              {lotes.map(lote => (
                <Tooltip
                  key={lote}
                  title={(row.produtosPorLote[lote] || []).join(', ')}
                >
                  <Chip label={lote} size="small" />
                </Tooltip>
              ))}
              {lotes.length > 1 && (
                <Tooltip title="Campo associado a mais de um lote">
                  <WarningAmberIcon fontSize="small" color="warning" />
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
      {
        id: 'qtdProdutos',
        label: 'Produtos',
        align: 'center' as const,
        sortable: true,
      },
    ],
    [],
  );

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Chip label={`${rows.length} campos`} variant="outlined" />
        <Chip
          label={`${semLote} sem produto associado`}
          color={semLote > 0 ? 'warning' : 'default'}
          variant={semLote > 0 ? 'filled' : 'outlined'}
        />
        <Chip
          label={`${multiplosLotes} com mais de um lote`}
          color={multiplosLotes > 0 ? 'info' : 'default'}
          variant={multiplosLotes > 0 ? 'filled' : 'outlined'}
        />
      </Stack>

      <Table
        columns={columns}
        rows={rows}
        isLoading={isLoadingCampos || isLoadingAssociacoes}
        rowKey={(row: CampoLoteRow) => row.id}
        searchPlaceholder="Buscar campo, órgão ou lote..."
        stickyHeader
        localization={{
          emptyDataMessage: 'Nenhum campo cadastrado.',
          searchPlaceholder: 'Buscar campo, órgão ou lote...',
        }}
      />
    </Box>
  );
};

export default CampoLoteTable;
