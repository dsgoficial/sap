// Path: features\map\routes\Maps.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useMapData } from '@/hooks/useMap';
import MapVisualization from '../components/MapVisualization';
import {
  useMapStore,
  selectLayers,
  selectVisibleLayers,
} from '@/stores/mapStore';
import { getLegendItems } from '../utils/mapStyles';


export const Maps = () => {
  const { isLoading, isError, error } = useMapData();

  const layers = useMapStore(selectLayers);
  const visibleLayers = useMapStore(selectVisibleLayers);
  const { toggleLayerVisibility } = useMapStore();

  if (isLoading) {
    return (
      <Page title="Mapas de Acompanhamento">
        <Container maxWidth="xl" disableGutters>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
            width="100%"
          >
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page title="Mapas de Acompanhamento">
        <Container maxWidth="xl" disableGutters>
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            Erro ao carregar dados de mapas:{' '}
            {error?.message || 'Tente novamente mais tarde.'}
          </Alert>
        </Container>
      </Page>
    );
  }

  // Check if we have any layers before trying to render the map
  if (!layers || layers.length === 0) {
    return (
      <Page title="Mapas de Acompanhamento">
        <Container maxWidth="xl" disableGutters>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Mapas de Acompanhamento
          </Typography>
          <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
            Nenhum dado de mapa disponível para visualização.
          </Alert>
        </Container>
      </Page>
    );
  }

  const legendItems = getLegendItems();

  return (
    <Page title="Mapas de Acompanhamento">
      <Container 
        maxWidth={false} 
        disableGutters
        sx={{ 
          height: 'auto',
          px: 3,
          overflow: 'hidden'
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          Mapas de Acompanhamento
        </Typography>

        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <MapVisualization
            layers={layers}
            legendItems={legendItems}
            visibleLayers={visibleLayers}
            onToggleLayer={toggleLayerVisibility}
          />
        </Box>
      </Container>
    </Page>
  );
};