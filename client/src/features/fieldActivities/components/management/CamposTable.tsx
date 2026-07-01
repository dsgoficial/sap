// Path: features\fieldActivities\components\management\CamposTable.tsx
import { useMemo, useState } from 'react';
import { Box, Button, Stack, IconButton, Tooltip, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useSnackbar } from 'notistack';
import { Table } from '@/components/ui/Table';
import { useCampos, useDeleteCampo } from '@/hooks/useFieldManagement';
import { Campo } from '@/types/fieldActivities';
import CampoFormDialog from './CampoFormDialog';
import CampoDetailDialog from './CampoDetailDialog';
import ConfirmDialog from './ConfirmDialog';

export const CamposTable = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: campos = [], isLoading } = useCampos();
  const deleteMutation = useDeleteCampo();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCampo, setEditingCampo] = useState<Campo | null>(null);
  const [detailCampo, setDetailCampo] = useState<Campo | null>(null);
  const [deletingCampo, setDeletingCampo] = useState<Campo | null>(null);

  const handleNew = () => {
    setEditingCampo(null);
    setFormOpen(true);
  };

  const handleEdit = (campo: Campo) => {
    setEditingCampo(campo);
    setFormOpen(true);
  };

  // Ordem padrão: por data de início, do mais recente para o mais antigo.
  // (O usuário ainda pode reordenar clicando nos cabeçalhos da tabela.)
  const camposOrdenados = useMemo(() => {
    return [...campos].sort((a, b) => {
      const da = a.inicio ? new Date(a.inicio).getTime() : -Infinity;
      const db = b.inicio ? new Date(b.inicio).getTime() : -Infinity;
      return db - da;
    });
  }, [campos]);

  const handleDelete = async () => {
    if (!deletingCampo) return;
    try {
      await deleteMutation.mutateAsync(deletingCampo.id);
      enqueueSnackbar('Campo excluído com sucesso', { variant: 'success' });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro ao excluir campo';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setDeletingCampo(null);
    }
  };

  const columns = useMemo(
    () => [
      { id: 'nome', label: 'Nome', align: 'left' as const, sortable: true },
      { id: 'orgao', label: 'Órgão', align: 'left' as const, sortable: true },
      { id: 'pit', label: 'PIT', align: 'center' as const, sortable: true },
      {
        id: 'inicio',
        label: 'Data',
        align: 'center' as const,
        sortable: true,
        format: (value: string) =>
          value ? new Date(value).toLocaleDateString('pt-BR') : '—',
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
        id: 'qtd_fotos',
        label: 'Fotos',
        align: 'center' as const,
        sortable: true,
      },
      {
        id: 'qtd_track',
        label: 'Tracks',
        align: 'center' as const,
        sortable: true,
      },
      {
        id: 'produtos_associados',
        label: 'Produtos',
        align: 'center' as const,
        sortable: true,
      },
      {
        id: 'actions',
        label: 'Ações',
        align: 'right' as const,
        format: (_value: unknown, row: Campo) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Gerenciar produtos/fotos/tracks">
              <IconButton size="small" onClick={() => setDetailCampo(row)}>
                <FolderOpenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => handleEdit(row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeletingCampo(row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNew}>
          Novo campo
        </Button>
      </Stack>

      <Table
        columns={columns}
        rows={camposOrdenados}
        isLoading={isLoading}
        rowKey={(row: Campo) => row.id}
        searchPlaceholder="Buscar campo..."
        stickyHeader
        localization={{
          emptyDataMessage: 'Nenhum campo cadastrado.',
          searchPlaceholder: 'Buscar campo...',
        }}
      />

      <CampoFormDialog
        open={formOpen}
        campo={editingCampo}
        onClose={() => setFormOpen(false)}
      />

      <CampoDetailDialog
        open={!!detailCampo}
        campo={detailCampo}
        onClose={() => setDetailCampo(null)}
      />

      <ConfirmDialog
        open={!!deletingCampo}
        title="Excluir campo"
        message={`Deseja excluir o campo "${deletingCampo?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isSubmitting={deleteMutation.isPending}
        onClose={() => setDeletingCampo(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default CamposTable;
