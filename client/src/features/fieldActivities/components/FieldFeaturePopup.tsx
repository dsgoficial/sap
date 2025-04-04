// Path: features\fieldActivities\components\FieldFeaturePopup.tsx
import React, { useEffect, useRef } from 'react';
import {
  Box,
  Popover,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  useTheme,
  Divider,
  CircularProgress,
} from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useFotosByCampo, useTracksByCampo } from '@/hooks/useFieldActivities';
import { Campo } from '@/types/fieldActivities';

interface FieldFeaturePopupProps {
  selectedFeature: Campo | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onViewDetails: (campoId: string) => void;
  onViewFotos: (campoId: string, campoNome: string) => void;
}

const FieldFeaturePopup: React.FC<FieldFeaturePopupProps> = ({
  selectedFeature,
  anchorEl,
  onClose,
  onViewDetails,
}) => {
  const theme = useTheme();
  // Referência para o botão de fechar
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sempre chame os hooks, independentemente de selectedFeature ser null
  // Use o ID do campo ou uma string vazia (que não disparará a query devido à flag enabled)
  const campoId = selectedFeature?.id || '';
  const { data: fotos, isLoading: loadingFotos } = useFotosByCampo(campoId);
  const { data: tracks, isLoading: loadingTracks } = useTracksByCampo(campoId);

  // Manipule o fechamento do popover
  const handleClose = () => {
    // Garanta que o botão perca o foco antes de fechar
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  // Garantir que o foco seja adequadamente gerenciado
  useEffect(() => {
    // Se o popover estiver fechando, mova o foco para um local adequado
    return () => {
      if (
        document.activeElement instanceof HTMLElement &&
        document.activeElement.closest('[aria-hidden="true"]')
      ) {
        document.activeElement.blur();
      }
    };
  }, []);

  // Se não há feature selecionada, não renderize nada
  if (!selectedFeature) return null;

  // Extraia as propriedades da feature selecionada
  const {
    id,
    nome,
    descricao,
    situacao,
    inicio,
    fim,
    qtd_fotos: propQtdFotos,
    qtd_track: propQtdTrack,
    orgao,
    pit,
  } = selectedFeature;

  // Use contagens reais ou fallback para as propriedades
  const fotosCount = fotos ? fotos.length : propQtdFotos || 0;
  const tracksCount = tracks ? tracks.length : propQtdTrack || 0;

  // Função auxiliar para formatar datas
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      console.warn(`Erro ao formatar data: ${dateString}`, e);
      return dateString;
    }
  };

  // Manipuladores de eventos
  const handleViewDetails = () => {
    onViewDetails(id);
    handleClose();
  };

  return (
    <Popover
      open={Boolean(selectedFeature && anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          p: 2,
          maxWidth: 400,
          maxHeight: 500,
          overflow: 'auto',
          bgcolor: theme.palette.background.paper,
        },
      }}
      // Melhorar gerenciamento de foco
      disableRestoreFocus
    >
      <Box>
        {/* Título e descrição */}
        <Typography variant="h6" gutterBottom>
          {nome || 'Atividade de Campo'}
        </Typography>

        {descricao && (
          <Typography variant="body2" gutterBottom color="text.secondary">
            {descricao}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Tabela de informações */}
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell
                component="th"
                scope="row"
                sx={{ fontWeight: 'bold', p: 1 }}
              >
                Situação
              </TableCell>
              <TableCell align="right" sx={{ p: 1 }}>
                {situacao || '-'}
              </TableCell>
            </TableRow>

            {orgao && (
              <TableRow>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: 'bold', p: 1 }}
                >
                  Órgão
                </TableCell>
                <TableCell align="right" sx={{ p: 1 }}>
                  {orgao}
                </TableCell>
              </TableRow>
            )}

            {pit && (
              <TableRow>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ fontWeight: 'bold', p: 1 }}
                >
                  PIT
                </TableCell>
                <TableCell align="right" sx={{ p: 1 }}>
                  {pit}
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell
                component="th"
                scope="row"
                sx={{ fontWeight: 'bold', p: 1 }}
              >
                Data Início
              </TableCell>
              <TableCell align="right" sx={{ p: 1 }}>
                {formatDate(inicio)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                component="th"
                scope="row"
                sx={{ fontWeight: 'bold', p: 1 }}
              >
                Data Fim
              </TableCell>
              <TableCell align="right" sx={{ p: 1 }}>
                {formatDate(fim)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Divider sx={{ my: 1.5 }} />

        {/* Contagens de fotos e tracks */}
        <Box sx={{ display: 'flex', mb: 2 }}>
          {/* Contagem de fotos */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              bgcolor: theme.palette.action.hover,
              mr: 1,
              position: 'relative',
            }}
          >
            <PhotoLibraryIcon color="primary" />
            {loadingFotos ? (
              <CircularProgress size={20} sx={{ my: 0.5 }} />
            ) : (
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                {fotosCount}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Fotos
            </Typography>
            {fotosCount > 0}
          </Box>

          {/* Contagem de tracks */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 1,
              borderRadius: 1,
              bgcolor: theme.palette.action.hover,
              ml: 1,
              position: 'relative',
            }}
          >
            <TimelineIcon color="primary" />
            {loadingTracks ? (
              <CircularProgress size={20} sx={{ my: 0.5 }} />
            ) : (
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                {tracksCount}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Tracks
            </Typography>
            {tracksCount > 0}
          </Box>
        </Box>

        {/* Botões de rodapé */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button size="small" variant="outlined" onClick={handleViewDetails}>
            Detalhes
          </Button>
          <Button size="small" onClick={handleClose} ref={closeButtonRef}>
            Fechar
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default React.memo(FieldFeaturePopup);
