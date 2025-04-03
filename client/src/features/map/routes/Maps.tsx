// Path: features\map\routes\Maps.tsx
import React, { useMemo, useCallback } from 'react';
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
import { useLayers, useVisibleLayers, useMapActions } from '@/stores/mapStore';
import { getLegendItems } from '../utils/mapStyles';

export const Maps = () => {
  const { isLoading, isError, error } = useMapData();

  const layers = useLayers();
  const visibleLayers = useVisibleLayers();
  const { toggleLayerVisibility } = useMapActions();

  const handleToggleLayer = useCallback(
    (layerId: string) => {
      toggleLayerVisibility(layerId);
    },
    [toggleLayerVisibility],
  );

  // Memoize legend items to prevent recreation on each render
  const legendItems = useMemo(() => getLegendItems(), []);

  // Memoize initial view state to prevent unnecessary re-renders
  const initialViewState = useMemo(
    () => ({
      longitude: -54.5,
      latitude: -14.5,
      zoom: 4,
    }),
    [],
  );

  if (isLoading) {
    return (
      <Page title="Mapas de Acompanhamento">
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            height: 'auto',
            overflow: 'hidden',
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
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
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
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
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
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

  return (
    <Page title="Mapas de Acompanhamento">
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          height: 'auto',
          overflow: 'hidden',
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          Mapas de Acompanhamento
        </Typography>

        <Box
          sx={{
            width: '100%',
            mb: 3,
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <MapVisualization
            layers={layers}
            legendItems={legendItems}
            visibleLayers={visibleLayers}
            onToggleLayer={handleToggleLayer}
            initialViewState={initialViewState}
          />
        </Box>
      </Container>
    </Page>
  );
};

export default React.memo(Maps);
