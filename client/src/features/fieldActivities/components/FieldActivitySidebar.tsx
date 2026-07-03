// Path: features\fieldActivities\components\FieldActivitySidebar.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Drawer,
  Typography,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  Paper,
  Checkbox,
  Chip,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoIcon from '@mui/icons-material/Photo';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import TimelineIcon from '@mui/icons-material/Timeline';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import {
  useFotosByCampo,
  useTracksByCampo,
  useFieldActivities,
  useCampoById,
} from '@/hooks/useFieldActivities';
import { getFotoArquivo } from '@/services/fieldActivitiesService';
import {
  useSelectedCampoId,
  useSelectedTab,
  useShowSidebar,
  useFieldActivitiesActions,
  useFieldActivitiesStore,
} from '@/stores/fieldActivitiesStore';
import { formatDate } from '@/utils/formatters';

// TabPanel component for tab content
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ height: '100%', overflow: 'auto' }}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

// ImageDisplay component for photo rendering
interface ImageDisplayProps {
  foto: any;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ foto }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const theme = useTheme();
  const isVideo = foto.tipo === 'video';

  // O binário (foto ou vídeo) não vem mais no JSON da lista; é baixado pela
  // rota dedicada /campo/fotos/:id/arquivo (autenticada) e vira uma object URL.
  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;
    setLoading(true);
    setError(false);
    getFotoArquivo(foto.id)
      .then(blob => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        if (active) {
          setError(true);
          setImageUrl('/placeholder-image.jpg');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [foto.id]);

  if (loading) {
    return (
      <Box
        sx={{
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.action.hover,
        }}
      >
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          height: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: theme.palette.action.hover,
        }}
      >
        <Typography color="error" variant="body2" gutterBottom>
          Erro ao carregar imagem
        </Typography>
      </Box>
    );
  }

  if (isVideo) {
    // objectFit 'contain' preserva a proporção nativa (vertical/horizontal)
    return (
      <Box
        component="video"
        src={imageUrl}
        controls
        preload="metadata"
        sx={{
          width: '100%',
          height: 200,
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
      height="140"
      image={imageUrl}
      alt={foto.descricao || 'Foto da atividade'}
      sx={{ cursor: 'pointer' }}
      onClick={() => window.open(imageUrl, '_blank')}
    />
  );
};

// Small stat tile used in the summary header (fotos/tracks/produtos counts)
const StatTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  loading?: boolean;
}> = ({ icon, label, value, loading }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 1,
        borderRadius: 1,
        bgcolor: theme.palette.action.hover,
      }}
    >
      {icon}
      {loading ? (
        <CircularProgress size={20} sx={{ my: 0.5 }} />
      ) : (
        <Typography variant="h6" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
};

// Field summary component
const FieldSummary: React.FC<{ campoId: string }> = ({ campoId }) => {
  const { data: campo, isLoading } = useCampoById(campoId);
  const { data: fotos, isLoading: loadingFotos } = useFotosByCampo(campoId);
  const { data: tracks, isLoading: loadingTracks } = useTracksByCampo(campoId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" padding={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!campo) {
    return (
      <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
        Informações do campo não disponíveis.
      </Typography>
    );
  }

  const produtosCount = campo.produtos?.length || 0;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Resumo do Campo
      </Typography>

      {/* Contagens rápidas */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <StatTile
          icon={<PhotoLibraryIcon color="primary" />}
          label="Fotos"
          value={fotos ? fotos.length : 0}
          loading={loadingFotos}
        />
        <StatTile
          icon={<TimelineIcon color="primary" />}
          label="Tracks"
          value={tracks ? tracks.length : 0}
          loading={loadingTracks}
        />
        <StatTile
          icon={<Inventory2Icon color="primary" />}
          label="Produtos"
          value={produtosCount}
        />
      </Box>

      <Stack spacing={1.5}>
        {campo.descricao && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Descrição:
            </Typography>
            <Typography variant="body1">{campo.descricao}</Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Situação:
          </Typography>
          <Chip
            label={campo.situacao || 'Não especificada'}
            size="small"
            color={
              campo.situacao === 'Finalizado'
                ? 'success'
                : campo.situacao === 'Em Execução'
                  ? 'primary'
                  : campo.situacao === 'Previsto'
                    ? 'info'
                    : 'default'
            }
          />
        </Box>

        {campo.orgao && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Órgão:
            </Typography>
            <Typography variant="body1">{campo.orgao}</Typography>
          </Box>
        )}

        {campo.pit && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              PIT:
            </Typography>
            <Typography variant="body1">{campo.pit}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Data Início:
            </Typography>
            <Typography variant="body1">
              {campo.inicio ? formatDate(campo.inicio) : 'Não definida'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" align="right">
              Data Fim:
            </Typography>
            <Typography variant="body1" align="right">
              {campo.fim ? formatDate(campo.fim) : 'Não definida'}
            </Typography>
          </Box>
        </Box>

        {campo.militares && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Militares:
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {campo.militares}
            </Typography>
          </Box>
        )}

        {campo.placas_vtr && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Viaturas:
            </Typography>
            <Typography variant="body1">{campo.placas_vtr}</Typography>
          </Box>
        )}

        {produtosCount > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Produtos associados:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {campo.produtos!.map(produto => (
                <Chip key={produto.id} label={produto.nome} size="small" />
              ))}
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

// Tracks list component
const TracksList: React.FC<{
  campoId: string;
  selectedTracks: string[];
  onToggleTrack: (trackId: string) => void;
}> = ({ campoId, selectedTracks, onToggleTrack }) => {
  const theme = useTheme();
  const { data: tracks, isLoading } = useTracksByCampo(campoId);

  // Check if a track is selected
  const isTrackSelected = (trackId: string) => {
    return selectedTracks.includes(trackId);
  };

  // Format date function
  const formatTrackDate = (dateString?: string) => {
    if (!dateString) return 'Não especificada';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString || 'Não especificada';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" padding={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
        Nenhum track disponível para esta atividade.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tracks Disponíveis
      </Typography>

      {tracks.map(track => (
        <Paper
          key={track.id}
          elevation={1}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: isTrackSelected(track.id)
              ? theme.palette.mode === 'dark'
                ? 'rgba(144, 202, 249, 0.16)'
                : 'rgba(33, 101, 209, 0.08)'
              : undefined,
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={isTrackSelected(track.id)}
              onChange={() => onToggleTrack(track.id)}
              color="primary"
              sx={{ mr: 1 }}
            />
            <Box sx={{ flex: 1 }}>
              <Grid container spacing={2}>
                {/* Track data row 1 */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Chefe da Viatura
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {track.chefe_vtr || 'Não especificado'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Motorista
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {track.motorista || 'Não especificado'}
                  </Typography>
                </Grid>

                {/* Track data row 2 */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Placa da Viatura
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {track.placa_vtr || 'Não especificada'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Data
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatTrackDate(track.dia)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

// Photos grid component
const PhotosGrid: React.FC<{ campoId: string }> = ({ campoId }) => {
  const { data: fotos, isLoading } = useFotosByCampo(campoId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" padding={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!fotos || fotos.length === 0) {
    return (
      <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
        Nenhuma foto ou vídeo disponível para esta atividade.
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {fotos.map(foto => (
        <Grid item xs={12} sm={6} key={foto.id}>
          <Card>
            <ImageDisplay foto={foto} />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {foto.descricao || 'Sem descrição'}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {foto.data_imagem ? formatDate(foto.data_imagem) : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Main FieldActivitySidebar component
const FieldActivitySidebar: React.FC = () => {
  const theme = useTheme();
  const { handleCloseSidebar, toggleSelectedTrack } = useFieldActivities();

  // Get state from store using atomic selectors
  const campoId = useSelectedCampoId();
  const selectedTab = useSelectedTab();
  const showSidebar = useShowSidebar();
  const selectedTracks = useFieldActivitiesStore(state => state.selectedTracks);
  const campoNome = useFieldActivitiesStore(state => state.selectedCampoNome);

  // Get actions from store
  const { setSelectedTab } = useFieldActivitiesActions();

  // Convert tab name to index
  const tabValue = useMemo(() => {
    // Modificado: 'fotos' agora está na segunda aba (índice 1)
    return selectedTab === 'fotos' ? 1 : 0;
  }, [selectedTab]);

  // Tab change handler
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    // Modificado: índice 0 agora é 'resumo', índice 1 é 'fotos'
    const tabName = newValue === 1 ? 'fotos' : 'resumo';
    setSelectedTab(tabName);
  };

  return (
    <Drawer
      anchor="right"
      open={showSidebar}
      onClose={handleCloseSidebar}
      PaperProps={{
        sx: {
          width: { xs: '85%', sm: 400 },
          maxWidth: '100%',
          height: '100%',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" noWrap>
            {campoNome || 'Detalhes da Atividade'}
          </Typography>
          <IconButton onClick={handleCloseSidebar} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs - Modificado: renomeado para "Resumo" e "Fotos" */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab
              icon={<SummarizeIcon />}
              label="Resumo"
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab
              icon={<PhotoIcon />}
              label="Fotos"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {/* Summary tab (formerly Tracks tab) */}
          <TabPanel value={tabValue} index={0}>
            {campoId ? (
              <>
                <FieldSummary campoId={campoId} />
                <TracksList
                  campoId={campoId}
                  selectedTracks={selectedTracks}
                  onToggleTrack={toggleSelectedTrack}
                />
              </>
            ) : (
              <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                Selecione um campo para ver os detalhes.
              </Typography>
            )}
          </TabPanel>

          {/* Photos tab */}
          <TabPanel value={tabValue} index={1}>
            {campoId ? (
              <PhotosGrid campoId={campoId} />
            ) : (
              <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                Selecione um campo para ver as fotos.
              </Typography>
            )}
          </TabPanel>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FieldActivitySidebar;
