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
import { formatDate } from '@/utils/formatters';
import ConfirmDialog from './ConfirmDialog';

const MAX_BYTES = 7 * 1024 * 1024; // ~7MB binário (limite Joi ~10MB base64)

// Converte imagem_bin (string base64 | array | Buffer-json) em URL exibível
const imagemBinToUrl = (imageBin: unknown): string | null => {
  if (!imageBin) return null;
  try {
    if (typeof imageBin === 'string') {
      return imageBin.startsWith('data:')
        ? imageBin
        : `data:image/jpeg;base64,${imageBin}`;
    }
    let bytes: Uint8Array | null = null;
    if (Array.isArray(imageBin)) {
      bytes = new Uint8Array(imageBin as number[]);
    } else if (
      typeof imageBin === 'object' &&
      (imageBin as { type?: string }).type === 'Buffer' &&
      Array.isArray((imageBin as { data?: number[] }).data)
    ) {
      bytes = new Uint8Array((imageBin as { data: number[] }).data);
    } else if (typeof imageBin === 'object') {
      bytes = new Uint8Array(Object.values(imageBin as Record<string, number>));
    }
    if (!bytes) return null;
    return URL.createObjectURL(
      new Blob([bytes as unknown as BlobPart], { type: 'image/jpeg' }),
    );
  } catch {
    return null;
  }
};

const FotoThumb = ({ foto }: { foto: Foto }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = imagemBinToUrl(foto.imagem_bin);
    setUrl(u);
    return () => {
      if (u && u.startsWith('blob:')) URL.revokeObjectURL(u);
    };
  }, [foto.imagem_bin]);

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
    if (file.size > MAX_BYTES) {
      enqueueSnackbar('Imagem muito grande (máx. ~7MB)', { variant: 'error' });
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
        Adicionar foto
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
            accept="image/*"
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
        <Alert severity="info">Nenhuma foto cadastrada para este campo.</Alert>
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
