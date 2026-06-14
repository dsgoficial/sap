// Path: features\fieldActivities\components\management\TracksTab.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { useTracksByCampo } from '@/hooks/useFieldActivities';
import { useUpdateTrack, useDeleteTrack } from '@/hooks/useFieldManagement';
import { Track } from '@/types/fieldActivities';
import { formatDate } from '@/utils/formatters';
import ConfirmDialog from './ConfirmDialog';

interface TracksTabProps {
  campoId: string;
}

const toDateInput = (value?: string | null): string => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

export const TracksTab = ({ campoId }: TracksTabProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: tracks = [], isLoading } = useTracksByCampo(campoId);
  const updateMutation = useUpdateTrack();
  const deleteMutation = useDeleteTrack();

  const [editTrack, setEditTrack] = useState<Track | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [form, setForm] = useState({
    chefe_vtr: '',
    motorista: '',
    placa_vtr: '',
    dia: '',
  });

  useEffect(() => {
    if (editTrack) {
      setForm({
        chefe_vtr: editTrack.chefe_vtr ?? '',
        motorista: editTrack.motorista ?? '',
        placa_vtr: editTrack.placa_vtr ?? '',
        dia: toDateInput(editTrack.dia),
      });
    }
  }, [editTrack]);

  const handleSave = async () => {
    if (!editTrack) return;
    try {
      await updateMutation.mutateAsync({
        campoId,
        trackId: editTrack.id,
        track: {
          chefe_vtr: form.chefe_vtr,
          motorista: form.motorista,
          placa_vtr: form.placa_vtr,
          dia: form.dia ? new Date(form.dia).toISOString() : undefined,
        },
      });
      enqueueSnackbar('Track atualizado', { variant: 'success' });
      setEditTrack(null);
    } catch {
      enqueueSnackbar('Erro ao atualizar track', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!trackToDelete) return;
    try {
      await deleteMutation.mutateAsync({ campoId, trackId: trackToDelete.id });
      enqueueSnackbar('Track removido', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erro ao remover track', { variant: 'error' });
    } finally {
      setTrackToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Tracks ({tracks.length})
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        A importação de tracks (GPX) continua sendo feita pelo QGIS. Aqui é
        possível editar os metadados e excluir.
      </Alert>

      {tracks.length === 0 ? (
        <Alert severity="info">Nenhum track cadastrado para este campo.</Alert>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Chefe VTR</TableCell>
              <TableCell>Motorista</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Dia</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tracks.map(track => (
              <TableRow key={track.id}>
                <TableCell>{track.chefe_vtr}</TableCell>
                <TableCell>{track.motorista}</TableCell>
                <TableCell>{track.placa_vtr}</TableCell>
                <TableCell>{track.dia ? formatDate(track.dia) : ''}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setEditTrack(track)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setTrackToDelete(track)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={!!editTrack}
        onClose={() => setEditTrack(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Track</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Chefe da viatura"
              value={form.chefe_vtr}
              onChange={e => setForm({ ...form, chefe_vtr: e.target.value })}
              fullWidth
            />
            <TextField
              label="Motorista"
              value={form.motorista}
              onChange={e => setForm({ ...form, motorista: e.target.value })}
              fullWidth
            />
            <TextField
              label="Placa da viatura"
              value={form.placa_vtr}
              onChange={e => setForm({ ...form, placa_vtr: e.target.value })}
              fullWidth
            />
            <TextField
              label="Dia"
              type="date"
              value={form.dia}
              onChange={e => setForm({ ...form, dia: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTrack(null)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            loading={updateMutation.isPending}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!trackToDelete}
        title="Remover track"
        message="Deseja remover este track e seus pontos?"
        confirmLabel="Remover"
        isSubmitting={deleteMutation.isPending}
        onClose={() => setTrackToDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default TracksTab;
