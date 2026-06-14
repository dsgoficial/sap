// Path: features\pitNaoProducao\routes\PitNaoProducao.tsx
import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Page from '@/components/Page/Page';
import { Table } from '@/components/ui/Table';
import {
  getMetasNaoProducao,
  criarMeta,
  atualizarMeta,
  deletarMeta,
  getExecucaoMensal,
  salvarExecucao,
  MetaNaoProducao,
  MetaNaoProducaoInput,
  ExecucaoLinha,
} from '@/services/pitNaoProducaoService';
import { MESES } from '@/constants/meses';

const ANO_ATUAL = new Date().getFullYear();
const soData = (v: string | null) => (v ? String(v).slice(0, 10) : '');

const metaVazia = (ano: number): MetaNaoProducaoInput => ({
  ano,
  numero_meta: 4,
  item: '',
  descricao: '',
  unidade: '',
  meta: 0,
  prazo: null,
});

// Colunas que descrevem a meta em si, comuns às duas abas; cada aba acrescenta as suas.
const baseColumns = [
  {
    id: 'numero_meta',
    label: 'Meta',
    align: 'center' as const,
    minWidth: 70,
    format: (v: number) => `Meta ${v}`,
  },
  { id: 'item', label: 'Item', align: 'left' as const, minWidth: 60 },
  { id: 'descricao', label: 'Descrição', align: 'left' as const },
  {
    id: 'unidade',
    label: 'Unidade',
    align: 'left' as const,
    format: (v: string | null) => v || '-',
  },
  { id: 'meta', label: 'Planejado', align: 'center' as const, minWidth: 90 },
];

// ---------------------------------------------------------------------------
// Aba 1: definicao das metas do ano (cadastro) e placar (planejado x realizado).
// ---------------------------------------------------------------------------
const Definicoes = ({ ano }: { ano: number }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<MetaNaoProducaoInput>(metaVazia(ano));

  const { data: metas = [], isLoading } = useQuery({
    queryKey: ['pit_nao_producao', ano],
    queryFn: () => getMetasNaoProducao(ano),
  });

  // Uma meta nova/editada/removida muda tanto o placar (pit_nao_producao) quanto
  // o grid de lancamento de todos os meses do ano (pit_execucao_mensal).
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pit_nao_producao', ano] });
    queryClient.invalidateQueries({ queryKey: ['pit_execucao_mensal', ano] });
  };

  const criar = useMutation({
    mutationFn: (input: MetaNaoProducaoInput) => criarMeta(input),
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });
  const atualizar = useMutation({
    mutationFn: ({ id, input }: { id: number; input: MetaNaoProducaoInput }) =>
      atualizarMeta(id, input),
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });
  const remover = useMutation({
    mutationFn: (id: number) => deletarMeta(id),
    onSuccess: invalidate,
  });

  const abrirNovo = () => {
    setEditId(null);
    setForm(metaVazia(ano));
    setOpen(true);
  };

  const abrirEdicao = (m: MetaNaoProducao) => {
    setEditId(m.id);
    setForm({
      ano: m.ano,
      numero_meta: m.numero_meta,
      item: m.item,
      descricao: m.descricao,
      unidade: m.unidade,
      meta: m.meta,
      prazo: m.prazo,
    });
    setOpen(true);
  };

  const salvar = () => {
    const input: MetaNaoProducaoInput = {
      ...form,
      ano: Number(form.ano),
      numero_meta: Number(form.numero_meta),
      meta: Number(form.meta),
      unidade: form.unidade ? form.unidade : null,
      prazo: form.prazo ? form.prazo : null,
    };
    if (editId) {
      atualizar.mutate({ id: editId, input });
    } else {
      criar.mutate(input);
    }
  };

  const set = <K extends keyof MetaNaoProducaoInput>(
    key: K,
    value: MetaNaoProducaoInput[K],
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const columns = [
    ...baseColumns,
    {
      id: 'realizado',
      label: 'Realizado',
      align: 'center' as const,
      minWidth: 90,
      format: (v: number) => Number(v ?? 0),
    },
    {
      id: 'percentual',
      label: '%',
      align: 'center' as const,
      minWidth: 70,
      format: (v: number | null) => (v == null ? '-' : `${v}%`),
    },
    {
      id: 'prazo',
      label: 'Prazo',
      align: 'center' as const,
      format: (v: string | null) => (v ? soData(v) : '-'),
    },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'center' as const,
      format: (_v: unknown, row: MetaNaoProducao) => (
        <Box>
          <IconButton size="small" onClick={() => abrirEdicao(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm(`Remover a meta ${row.item}?`)) {
                remover.mutate(row.id);
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const erro = criar.error || atualizar.error || remover.error;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNovo}>
          Nova meta
        </Button>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao salvar a meta. Tente novamente.
        </Alert>
      )}

      <Table
        columns={columns}
        rows={metas}
        isLoading={isLoading}
        rowKey={(row: MetaNaoProducao) => row.id}
        emptyMessage="Nenhuma meta nao-producao cadastrada no ano."
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Editar meta' : 'Nova meta'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Ano"
                type="number"
                value={form.ano}
                onChange={e => set('ano', Number(e.target.value))}
                fullWidth
                required
              />
              <TextField
                label="Nº da meta"
                type="number"
                value={form.numero_meta}
                onChange={e => set('numero_meta', Number(e.target.value))}
                fullWidth
                required
                helperText="1 a 7 (ex.: 4, 6, 7)"
              />
              <TextField
                label="Item"
                value={form.item}
                onChange={e => set('item', e.target.value)}
                fullWidth
                required
                helperText='ex.: "4.1"'
              />
            </Stack>
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              fullWidth
              required
              multiline
              minRows={2}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Unidade"
                value={form.unidade ?? ''}
                onChange={e => set('unidade', e.target.value)}
                fullWidth
                helperText='ex.: "produtos", "registros"'
              />
              <TextField
                label="Planejado (meta anual)"
                type="number"
                value={form.meta}
                onChange={e => set('meta', Number(e.target.value))}
                fullWidth
                required
              />
            </Stack>
            <TextField
              label="Prazo (opcional)"
              type="date"
              value={soData(form.prazo)}
              onChange={e => set('prazo', e.target.value || null)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Para metas de prazo (ex.: itens de TI)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvar}
            disabled={
              !form.item ||
              !form.descricao ||
              criar.isPending ||
              atualizar.isPending
            }
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ---------------------------------------------------------------------------
// Aba 2: lancamento do realizado por mes (uma linha por meta).
// ---------------------------------------------------------------------------
const Lancamento = ({ ano }: { ano: number }) => {
  const queryClient = useQueryClient();
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const [editRow, setEditRow] = useState<ExecucaoLinha | null>(null);
  const [quantidade, setQuantidade] = useState('0');
  const [dataConclusao, setDataConclusao] = useState('');
  const [observacao, setObservacao] = useState('');

  const { data: linhas = [], isLoading } = useQuery({
    queryKey: ['pit_execucao_mensal', ano, mes],
    queryFn: () => getExecucaoMensal(ano, mes),
  });

  // Lancar o realizado muda o grid do mes e tambem o acumulado/% do placar (pit_nao_producao).
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pit_execucao_mensal', ano, mes] });
    queryClient.invalidateQueries({ queryKey: ['pit_nao_producao', ano] });
  };

  const salvar = useMutation({
    mutationFn: () =>
      salvarExecucao({
        pit_id: editRow!.pit_id,
        mes,
        quantidade: Number(quantidade) || 0,
        data_conclusao: dataConclusao || null,
        observacao: observacao || null,
      }),
    onSuccess: () => {
      invalidate();
      setEditRow(null);
    },
  });

  const abrirEdicao = (linha: ExecucaoLinha) => {
    setEditRow(linha);
    setQuantidade(String(linha.quantidade ?? 0));
    setDataConclusao(soData(linha.data_conclusao));
    setObservacao(linha.observacao ?? '');
  };

  const columns = [
    ...baseColumns,
    {
      id: 'quantidade',
      label: `Realizado (${MESES[mes - 1]})`,
      align: 'center' as const,
      minWidth: 120,
      format: (v: number | null) => (v == null ? '-' : v),
    },
    {
      id: 'data_conclusao',
      label: 'Concluído em',
      align: 'center' as const,
      format: (v: string | null) => (v ? soData(v) : '-'),
    },
    {
      id: 'observacao',
      label: 'Observação',
      align: 'left' as const,
      format: (v: string | null) => v || '-',
    },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'center' as const,
      format: (_v: unknown, row: ExecucaoLinha) => (
        <IconButton size="small" onClick={() => abrirEdicao(row)}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          select
          label="Mês"
          size="small"
          value={mes}
          onChange={e => setMes(Number(e.target.value))}
          sx={{ minWidth: 140 }}
          SelectProps={{ native: true }}
        >
          {MESES.map((nome, i) => (
            <option key={i + 1} value={i + 1}>
              {nome}
            </option>
          ))}
        </TextField>
      </Box>

      <Table
        columns={columns}
        rows={linhas}
        isLoading={isLoading}
        rowKey={(row: ExecucaoLinha) => row.pit_id}
        emptyMessage="Nenhuma meta nao-producao cadastrada para o ano (cadastre na aba Definições)."
      />

      <Dialog
        open={!!editRow}
        onClose={() => setEditRow(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editRow ? `${editRow.item} — ${editRow.descricao}` : 'Lançar'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={`Realizado em ${MESES[mes - 1]}/${ano}`}
              type="number"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              fullWidth
              helperText={
                editRow?.unidade
                  ? `Em ${editRow.unidade}`
                  : 'Quantidade realizada no mês'
              }
            />
            <TextField
              label="Concluído em (opcional)"
              type="date"
              value={dataConclusao}
              onChange={e => setDataConclusao(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Para metas de prazo (ex.: itens de TI)"
            />
            <TextField
              label="Observação (opcional)"
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRow(null)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => salvar.mutate()}
            disabled={salvar.isPending}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ---------------------------------------------------------------------------
// Pagina: seletor de ano + abas (Definicoes / Lancamento mensal).
// ---------------------------------------------------------------------------
export const PitNaoProducao = () => {
  const [ano, setAno] = useState(ANO_ATUAL);
  const [tab, setTab] = useState(0);

  return (
    <Page title="PIT (nao-producao)">
      <Container maxWidth="xl" disableGutters>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h4">Metas do PIT (não controladas pelo SAP)</Typography>
          <TextField
            label="Ano"
            type="number"
            size="small"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            sx={{ width: 120 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Metas do PIT cujo realizado o SAP não calcula (impressão, Programa
          Memória, TI, EBGeo). Cadastre na aba Definições e lance o realizado mês
          a mês na aba Lançamento mensal. A produção (folhas por lote) segue no PIT.
        </Typography>

        <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Definições" />
          <Tab label="Lançamento mensal" />
        </Tabs>

        {tab === 0 ? <Definicoes ano={ano} /> : <Lancamento ano={ano} />}
      </Container>
    </Page>
  );
};
