// Path: features\personnel\routes\Personnel.tsx
import { useState, useMemo } from 'react';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Page from '@/components/Page/Page';
import { Table } from '@/components/ui/Table';
import {
  getAproveitamento,
  getUsuarios,
  criarLinha,
  atualizarLinha,
  deletarLinha,
  copiarMesAnterior,
  iniciarDoEfetivo,
  AproveitamentoLinha,
} from '@/services/personnelService';
import { MESES } from '@/constants/meses';

const hoje = new Date();

export const Personnel = () => {
  const queryClient = useQueryClient();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);

  // Dialog de edicao da atividade de uma linha existente
  const [editLinha, setEditLinha] = useState<AproveitamentoLinha | null>(null);
  const [atividades, setAtividades] = useState('');

  // Dialog de adicao de um militar ao mes
  const [addOpen, setAddOpen] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState<number | ''>('');
  const [novaAtividade, setNovaAtividade] = useState('');

  const { data: linhas = [], isLoading } = useQuery({
    queryKey: ['aproveitamento', ano, mes],
    queryFn: () => getAproveitamento(ano, mes),
  });
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['aproveitamento', ano, mes] });

  const editar = useMutation({
    mutationFn: ({ id, texto }: { id: number; texto: string }) =>
      atualizarLinha(id, { atividades: texto || null }),
    onSuccess: () => {
      invalidate();
      setEditLinha(null);
    },
  });
  const adicionar = useMutation({
    mutationFn: () =>
      criarLinha({
        ano,
        mes,
        usuario_id: Number(novoUsuario),
        atividades: novaAtividade || null,
      }),
    onSuccess: () => {
      invalidate();
      setAddOpen(false);
      setNovoUsuario('');
      setNovaAtividade('');
    },
  });
  const remover = useMutation({
    mutationFn: (id: number) => deletarLinha(id),
    onSuccess: invalidate,
  });
  const copiar = useMutation({
    mutationFn: () => copiarMesAnterior(ano, mes),
    onSuccess: invalidate,
  });
  const iniciar = useMutation({
    mutationFn: () => iniciarDoEfetivo(ano, mes),
    onSuccess: invalidate,
  });

  const abrirEdicao = (linha: AproveitamentoLinha) => {
    setEditLinha(linha);
    setAtividades(linha.atividades ?? '');
  };

  // Militares ativos ainda nao lançados neste mes (para o dialog de adicao)
  const usuariosDisponiveis = useMemo(() => {
    const lancados = new Set(linhas.map(l => l.usuario_id));
    return usuarios.filter(u => u.ativo !== false && !lancados.has(u.id));
  }, [usuarios, linhas]);

  const columns = [
    {
      id: 'militar',
      label: 'Militar',
      align: 'left' as const,
      format: (_v: unknown, row: AproveitamentoLinha) =>
        `${row.posto ?? ''} ${row.nome_guerra ?? ''}`.trim(),
    },
    { id: 'atividades', label: 'Atividades', align: 'left' as const },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'center' as const,
      format: (_v: unknown, row: AproveitamentoLinha) => (
        <Box>
          <IconButton size="small" onClick={() => abrirEdicao(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (
                window.confirm(
                  `Remover ${row.posto} ${row.nome_guerra} do mês?`,
                )
              ) {
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

  const vazio = !isLoading && linhas.length === 0;

  return (
    <Page title="Aproveitamento do efetivo">
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Aproveitamento do efetivo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Seção 5.1 do RPCMTec, retrato por mês (Militar | Atividades). Cada mês
          é independente; use "copiar mês anterior" para preencher rápido.
        </Typography>

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
          >
            {MESES.map((nome, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {nome}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Ano"
            type="number"
            size="small"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            sx={{ width: 110 }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => copiar.mutate()}
            disabled={copiar.isPending}
          >
            Copiar mês anterior
          </Button>
          <Button
            variant="outlined"
            startIcon={<GroupAddIcon />}
            onClick={() => iniciar.mutate()}
            disabled={iniciar.isPending}
          >
            Iniciar do efetivo
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            disabled={usuariosDisponiveis.length === 0}
          >
            Adicionar militar
          </Button>
        </Box>

        {vazio && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Nenhum militar lançado em {MESES[mes - 1]}/{ano}. Use "copiar mês
            anterior" ou "iniciar do efetivo" para começar.
          </Alert>
        )}

        <Table
          columns={columns}
          rows={linhas}
          isLoading={isLoading}
          rowKey={(row: AproveitamentoLinha) => row.id}
          emptyMessage="Nenhum militar lançado no mês."
        />

        {/* Editar atividade de uma linha */}
        <Dialog
          open={!!editLinha}
          onClose={() => setEditLinha(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editLinha
              ? `${editLinha.posto} ${editLinha.nome_guerra}`
              : 'Editar'}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Atividades"
              value={atividades}
              onChange={e => setAtividades(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 1 }}
              helperText='Vazio = só produziu. ex.: "Chefe da 5ª seção", "Mestrado Parcial"'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditLinha(null)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={() =>
                editLinha &&
                editar.mutate({ id: editLinha.id, texto: atividades })
              }
              disabled={editar.isPending}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Adicionar militar ao mes */}
        <Dialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Adicionar militar ao mês</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="Militar"
                value={novoUsuario}
                onChange={e => setNovoUsuario(Number(e.target.value))}
                fullWidth
                required
              >
                {usuariosDisponiveis.map(u => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.nome_guerra || u.nome}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Atividades"
                value={novaAtividade}
                onChange={e => setNovaAtividade(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={() => adicionar.mutate()}
              disabled={!novoUsuario || adicionar.isPending}
            >
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
};
