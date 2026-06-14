// Path: features\training\routes\Training.tsx
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
  MenuItem,
  Stack,
  IconButton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Page from '@/components/Page/Page';
import { Table } from '@/components/ui/Table';
import {
  getCapacitacoes,
  getSituacoesCapacitacao,
  criarCapacitacao,
  atualizarCapacitacao,
  deletarCapacitacao,
  Capacitacao,
  CapacitacaoInput,
} from '@/services/capacitacaoService';

const ANO_ATUAL = new Date().getFullYear();

const vazia = (): CapacitacaoInput => ({
  nome: '',
  tipo: 'Ministrada',
  instituicoes: '',
  local: '',
  inicio: null,
  fim: null,
  efetivo_capacitado: null,
  militares: '',
  plano_codigo: '',
  ano: ANO_ATUAL,
  situacao_id: 1,
  documento: '',
});

const soData = (iso: string | null): string =>
  iso ? String(iso).slice(0, 10) : '';

export const Training = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CapacitacaoInput>(vazia());

  const { data: capacitacoes = [], isLoading } = useQuery({
    queryKey: ['capacitacoes'],
    queryFn: getCapacitacoes,
  });
  const { data: situacoes = [] } = useQuery({
    queryKey: ['capacitacoes', 'situacoes'],
    queryFn: getSituacoesCapacitacao,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['capacitacoes'] });

  const criar = useMutation({
    mutationFn: (input: CapacitacaoInput) => criarCapacitacao(input),
    onSuccess: () => {
      invalidate();
      fechar();
    },
  });
  const atualizar = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CapacitacaoInput }) =>
      atualizarCapacitacao(id, input),
    onSuccess: () => {
      invalidate();
      fechar();
    },
  });
  const remover = useMutation({
    mutationFn: (id: string) => deletarCapacitacao(id),
    onSuccess: invalidate,
  });

  const abrirNovo = () => {
    setEditId(null);
    setForm(vazia());
    setOpen(true);
  };

  const abrirEdicao = (c: Capacitacao) => {
    setEditId(c.id);
    setForm({
      nome: c.nome,
      tipo: c.tipo,
      instituicoes: c.instituicoes,
      local: c.local,
      inicio: c.inicio,
      fim: c.fim,
      efetivo_capacitado: c.efetivo_capacitado,
      militares: c.militares,
      plano_codigo: c.plano_codigo,
      ano: c.ano,
      situacao_id: c.situacao_id,
      documento: c.documento,
    });
    setOpen(true);
  };

  const fechar = () => setOpen(false);

  const salvar = () => {
    const input: CapacitacaoInput = {
      ...form,
      instituicoes: form.instituicoes || null,
      local: form.local || null,
      militares: form.militares || null,
      plano_codigo: form.plano_codigo || null,
      documento: form.documento || null,
      inicio: form.inicio || null,
      fim: form.fim || null,
      efetivo_capacitado:
        form.efetivo_capacitado === null || form.efetivo_capacitado === undefined
          ? null
          : Number(form.efetivo_capacitado),
      ano: Number(form.ano),
      situacao_id: Number(form.situacao_id),
    };
    if (editId) {
      atualizar.mutate({ id: editId, input });
    } else {
      criar.mutate(input);
    }
  };

  const set = <K extends keyof CapacitacaoInput>(
    key: K,
    value: CapacitacaoInput[K],
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const columns = [
    { id: 'nome', label: 'Capacitação', align: 'left' as const, sortable: true },
    { id: 'tipo', label: 'Tipo', align: 'center' as const, sortable: true },
    { id: 'instituicoes', label: 'Instituições', align: 'left' as const },
    {
      id: 'periodo',
      label: 'Período',
      align: 'center' as const,
      format: (_v: unknown, row: Capacitacao) =>
        `${soData(row.inicio) || '-'} a ${soData(row.fim) || '-'}`,
    },
    {
      id: 'efetivo_capacitado',
      label: 'Efetivo capacitado',
      align: 'center' as const,
    },
    { id: 'situacao', label: 'Situação', align: 'center' as const },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'center' as const,
      format: (_v: unknown, row: Capacitacao) => (
        <Box>
          <IconButton size="small" onClick={() => abrirEdicao(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm(`Remover a capacitação "${row.nome}"?`)) {
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
    <Page title="Capacitações">
      <Container maxWidth="xl" disableGutters>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">Capacitações</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNovo}>
            Nova capacitação
          </Button>
        </Box>

        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao salvar a capacitação. Tente novamente.
          </Alert>
        )}

        <Table
          columns={columns}
          rows={capacitacoes}
          isLoading={isLoading}
          rowKey={(row: Capacitacao) => row.id}
          emptyMessage="Nenhuma capacitação cadastrada."
        />

        <Dialog open={open} onClose={fechar} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editId ? 'Editar capacitação' : 'Nova capacitação'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Nome / Capacitação"
                value={form.nome}
                onChange={e => set('nome', e.target.value)}
                fullWidth
                required
              />
              <TextField
                select
                label="Tipo"
                value={form.tipo}
                onChange={e =>
                  set('tipo', e.target.value as CapacitacaoInput['tipo'])
                }
                fullWidth
                helperText="Ministrada (2.5) ou Recebida pelo efetivo (5.2)"
              >
                <MenuItem value="Ministrada">Ministrada</MenuItem>
                <MenuItem value="Recebida">Recebida</MenuItem>
              </TextField>
              <TextField
                label="Instituições participantes"
                value={form.instituicoes ?? ''}
                onChange={e => set('instituicoes', e.target.value)}
                fullWidth
              />
              <TextField
                label="Local"
                value={form.local ?? ''}
                onChange={e => set('local', e.target.value)}
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Início"
                  type="date"
                  value={soData(form.inicio)}
                  onChange={e => set('inicio', e.target.value || null)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Fim"
                  type="date"
                  value={soData(form.fim)}
                  onChange={e => set('fim', e.target.value || null)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Efetivo capacitado"
                  type="number"
                  value={form.efetivo_capacitado ?? ''}
                  onChange={e =>
                    set(
                      'efetivo_capacitado',
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                  fullWidth
                />
                <TextField
                  label="Ano"
                  type="number"
                  value={form.ano}
                  onChange={e => set('ano', Number(e.target.value))}
                  fullWidth
                  required
                />
              </Stack>
              <TextField
                label="Militares (instrutores ou capacitando)"
                value={form.militares ?? ''}
                onChange={e => set('militares', e.target.value)}
                fullWidth
              />
              <TextField
                label="Plano / Código (5.2)"
                value={form.plano_codigo ?? ''}
                onChange={e => set('plano_codigo', e.target.value)}
                fullWidth
              />
              <TextField
                select
                label="Situação"
                value={form.situacao_id}
                onChange={e => set('situacao_id', Number(e.target.value))}
                fullWidth
              >
                {situacoes.map(s => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.nome}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Documento (OI/OS)"
                value={form.documento ?? ''}
                onChange={e => set('documento', e.target.value)}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={fechar}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={salvar}
              disabled={!form.nome || criar.isPending || atualizar.isPending}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
};
