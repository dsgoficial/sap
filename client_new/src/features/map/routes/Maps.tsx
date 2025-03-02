// Path: features\map\routes\Maps.tsx
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Page from '@/components/Page/Page';
import { useMapData, getLegendItems } from '@/hooks/useMap';
import MapVisualization from '../components/MapVisualization';
import { useMapStore } from '@/stores/mapStore';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

export const Maps = () => {
  const { isAdmin } = useAuthStore();
  const { isLoading, isError } = useMapData();
  const { layers, visibleLayers, toggleLayerVisibility } = useMapStore();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <Page title="Mapas de Acompanhamento">
        <Container maxWidth="xl">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
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
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ mt: 2 }}>
            Erro ao carregar dados de mapas. Por favor, tente novamente.
          </Alert>
        </Container>
      </Page>
    );
  }

  const legendItems = getLegendItems();

  return (
    <Page title="Mapas de Acompanhamento">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Mapas de Acompanhamento
        </Typography>

        <MapVisualization
          title="Visão Geral"
          layers={layers}
          legendItems={legendItems}
          visibleLayers={visibleLayers}
          onToggleLayer={toggleLayerVisibility}
          initialViewState={{
            longitude: -52.956841,
            latitude: -15.415179,
            zoom: 3.65,
          }}
        />
      </Container>
    </Page>
  );
};
