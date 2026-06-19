// Path: features\fieldActivities\components\management\FotosTab.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import { useSnackbar } from 'notistack';
import { useFotosByCampo } from '@/hooks/useFieldActivities';
import { useCreateFotos, useDeleteFoto } from '@/hooks/useFieldManagement';
import { Foto, FotoInput } from '@/types/fieldActivities';
import { getFotoArquivo } from '@/services/fieldActivitiesService';
import { formatDate } from '@/utils/formatters';
import ConfirmDialog from './ConfirmDialog';

const MAX_FOTO_BYTES = 7 * 1024 * 1024; // ~7MB binário (foto)
const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // 40MB binário (vídeo)

const FotoThumb = ({ foto }: { foto: Foto }) => {
  const [url, setUrl] = useState<string | null>(null);
  const isVideo = foto.tipo === 'video';
  // Baixa o binário pela rota dedicada (autenticada) e gera uma object URL.
  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;
    getFotoArquivo(foto.id)
      .then(blob => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [foto.id]);

  if (isVideo) {
    return (
      // objectFit 'contain' preserva a proporção nativa do vídeo (vertical ou
      // horizontal); 'cover' cortava vídeos verticais para preencher a caixa.
      <Box
        component="video"
        src={url || undefined}
        controls
        preload="metadata"
        sx={{
          width: '100%',
          height: 160,
          objectFit: 'contain',
          backgroundColor: 'black',
          display: 'block',
        }}
      />
    );
  }

  return (
    <CardMedia
      component="img"
      height="160"
      image={url || '/placeholder-image.jpg'}
      alt={foto.descricao || 'Foto'}
      sx={{ cursor: url ? 'pointer' : 'default', objectFit: 'cover' }}
      onClick={() => url && window.open(url, '_blank')}
    />
  );
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface FotosTabProps {
  campoId: string;
}

export const FotosTab = ({ campoId }: FotosTabProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: fotos = [], isLoading } = useFotosByCampo(campoId);
  const createMutation = useCreateFotos();
  const deleteMutation = useDeleteFoto();

  const [file, setFile] = useState<File | null>(null);
  const [descricao, setDescricao] = useState('');
  const [dataImagem, setDataImagem] = useState('');
  const [fotoToDelete, setFotoToDelete] = useState<Foto | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_FOTO_BYTES;
    if (file.size > maxBytes) {
      enqueueSnackbar(
        isVideo
          ? 'Vídeo muito grande (máx. 40MB)'
          : 'Imagem muito grande (máx. ~7MB)',
        { variant: 'error' },
      );
      return;
    }
    try {
      const imagem_base64 = await fileToBase64(file);
      const payload: FotoInput = {
        campo_id: campoId,
        descricao: descricao || file.name,
        data_imagem: dataImagem
          ? new Date(dataImagem).toISOString()
          : new Date().toISOString(),
        tipo: isVideo ? 'video' : 'foto',
        mime_type: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        imagem_base64,
      };
      await createMutation.mutateAsync({ campoId, fotos: [payload] });
      enqueueSnackbar('Foto adicionada com sucesso', { variant: 'success' });
      setFile(null);
      setDescricao('');
      setDataImagem('');
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro ao enviar foto';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!fotoToDelete) return;
    try {
      await deleteMutation.mutateAsync({ campoId, fotoId: fotoToDelete.id });
      enqueueSnackbar('Foto removida', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erro ao remover foto', { variant: 'error' });
    } finally {
      setFotoToDelete(null);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Adicionar foto ou vídeo
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2, alignItems: { sm: 'center' } }}
      >
        <Button variant="outlined" component="label">
          {file ? file.name : 'Selecionar arquivo'}
          <input
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
        </Button>
        <TextField
          label="Descrição"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          label="Data"
          type="date"
          value={dataImagem}
          onChange={e => setDataImagem(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleUpload}
          disabled={!file}
          loading={createMutation.isPending}
        >
          Enviar
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : fotos.length === 0 ? (
        <Alert severity="info">
          Nenhuma foto ou vídeo cadastrado para este campo.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {fotos.map(foto => (
            <Grid item xs={12} sm={6} md={4} key={foto.id}>
              <Card>
                <FotoThumb foto={foto} />
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="body2" noWrap title={foto.descricao}>
                    {foto.descricao || 'Sem descrição'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {foto.data_imagem ? formatDate(foto.data_imagem) : ''}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setFotoToDelete(foto)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={!!fotoToDelete}
        title="Remover foto"
        message="Deseja remover esta foto?"
        confirmLabel="Remover"
        isSubmitting={deleteMutation.isPending}
        onClose={() => setFotoToDelete(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default FotosTab;
