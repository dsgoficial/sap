// Path: features\extraPit\routes\ExtraPit.tsx
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
  getExtraPitByAno,
  getSituacoesExtraPit,
  criarExtraPit,
  atualizarExtraPit,
  deletarExtraPit,
  ExtraPit as ExtraPitItem,
  ExtraPitInput,
} from '@/services/extraPitService';

const ANO_ATUAL = new Date().getFullYear();

const vazia = (ano: number): ExtraPitInput => ({
  ano,
  demandante: '',
  tipo_produto: '',
  quantidade: 1,
  situacao_id: 1,
  documento_autorizacao: '',
  descricao: '',
  data_entrega: null,
  lote_id: null,
});

export const ExtraPit = () => {
  const queryClient = useQueryClient();
  const [ano, setAno] = useState(ANO_ATUAL);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ExtraPitInput>(vazia(ANO_ATUAL));

  const { data: demandas = [], isLoading } = useQuery({
    queryKey: ['extra_pit', ano],
    queryFn: () => getExtraPitByAno(ano),
  });
  const { data: situacoes = [] } = useQuery({
    queryKey: ['extra_pit', 'situacoes'],
    queryFn: getSituacoesExtraPit,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['extra_pit'] });

  const criar = useMutation({
    mutationFn: (input: ExtraPitInput) => criarExtraPit(input),
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });
  const atualizar = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ExtraPitInput }) =>
      atualizarExtraPit(id, input),
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });
  const remover = useMutation({
    mutationFn: (id: number) => deletarExtraPit(id),
    onSuccess: invalidate,
  });

  const abrirNovo = () => {
    setEditId(null);
    setForm(vazia(ano));
    setOpen(true);
  };

  const abrirEdicao = (d: ExtraPitItem) => {
    setEditId(d.id);
    setForm({
      ano: d.ano,
      demandante: d.demandante,
      tipo_produto: d.tipo_produto,
      quantidade: d.quantidade,
      situacao_id: d.situacao_id,
      documento_autorizacao: d.documento_autorizacao,
      descricao: d.descricao,
      data_entrega: d.data_entrega,
      lote_id: d.lote_id,
    });
    setOpen(true);
  };

  const salvar = () => {
    const input: ExtraPitInput = {
      ...form,
      ano: Number(form.ano),
      quantidade: Number(form.quantidade),
      situacao_id: Number(form.situacao_id),
      descricao: form.descricao || null,
      data_entrega: form.data_entrega || null,
      lote_id: form.lote_id === null ? null : Number(form.lote_id),
    };
    if (editId) {
      atualizar.mutate({ id: editId, input });
    } else {
      criar.mutate(input);
    }
  };

  const set = <K extends keyof ExtraPitInput>(
    key: K,
    value: ExtraPitInput[K],
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const columns = [
    { id: 'demandante', label: 'Demandante', align: 'left' as const, sortable: true },
    { id: 'tipo_produto', label: 'Tipo de produto', align: 'left' as const },
    { id: 'quantidade', label: 'Quantidade', align: 'center' as const },
    { id: 'situacao', label: 'Situação', align: 'center' as const },
    {
      id: 'data_entrega',
      label: 'Data de entrega',
      align: 'center' as const,
      sortable: true,
      format: (v: string | null) =>
        v ? new Date(v).toLocaleDateString('pt-BR') : '-',
    },
    {
      id: 'documento_autorizacao',
      label: 'Documento autorização',
      align: 'left' as const,
    },
    {
      id: 'lote_nome',
      label: 'Lote',
      align: 'left' as const,
      format: (v: string | null) => v || '-',
    },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'center' as const,
      format: (_v: unknown, row: ExtraPitItem) => (
        <Box>
          <IconButton size="small" onClick={() => abrirEdicao(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm('Remover esta demanda Extra-PIT?')) {
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
    <Page title="Extra-PIT">
      <Container maxWidth="xl" disableGutters>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h4">Extra-PIT</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Ano"
              type="number"
              size="small"
              value={ano}
              onChange={e => setAno(Number(e.target.value))}
              sx={{ width: 120 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirNovo}
            >
              Nova demanda
            </Button>
          </Box>
        </Box>

        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erro ao salvar a demanda. Tente novamente.
          </Alert>
        )}

        <Table
          columns={columns}
          rows={demandas}
          isLoading={isLoading}
          rowKey={(row: ExtraPitItem) => row.id}
          emptyMessage="Nenhuma demanda Extra-PIT no ano."
        />

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editId ? 'Editar demanda Extra-PIT' : 'Nova demanda Extra-PIT'}
          </DialogTitle>
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
                  label="Quantidade"
                  type="number"
                  value={form.quantidade}
                  onChange={e => set('quantidade', Number(e.target.value))}
                  fullWidth
                  required
                />
              </Stack>
              <TextField
                label="Demandante"
                value={form.demandante}
                onChange={e => set('demandante', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Tipo de produto"
                value={form.tipo_produto}
                onChange={e => set('tipo_produto', e.target.value)}
                fullWidth
                required
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
                label="Documento de autorização"
                value={form.documento_autorizacao}
                onChange={e => set('documento_autorizacao', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Descrição"
                value={form.descricao ?? ''}
                onChange={e => set('descricao', e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                label="Data de entrega"
                type="date"
                value={form.data_entrega ?? ''}
                onChange={e => set('data_entrega', e.target.value || null)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Mês desta data define em qual RPCMTec a demanda entra (2.6)"
              />
              <TextField
                label="Lote (id, opcional)"
                type="number"
                value={form.lote_id ?? ''}
                onChange={e =>
                  set('lote_id', e.target.value === '' ? null : Number(e.target.value))
                }
                fullWidth
                helperText="Preencher quando a demanda virou lote de produção"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={salvar}
              disabled={
                !form.demandante ||
                !form.tipo_produto ||
                !form.documento_autorizacao ||
                criar.isPending ||
                atualizar.isPending
              }
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
};
