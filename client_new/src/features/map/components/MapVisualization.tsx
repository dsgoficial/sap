// Path: features\map\components\MapVisualization.tsx
import { useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Fab,
  Divider,
  Collapse,
  Button,
} from '@mui/material';
import Map, {
  Source,
  Layer,
  LayerProps,
  NavigationControl,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLegend from './MapLegend';
import LayerControl from './LayerControl';
import { MapLayer, LegendItem } from '@/types/map';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const MapContainer = styled(Box)(({ theme }) => ({
  height: '70vh',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    height: '60vh',
  },
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  maxHeight: 'calc(100% - 30px)',
  overflowY: 'auto',
  width: 200,
  display: 'none', // Hide on mobile, will use drawer instead
  [theme.breakpoints.up('md')]: {
    display: 'block',
  },
}));

const MobileFab = styled(Fab)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: 20,
  zIndex: 10,
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const FullscreenButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  [theme.breakpoints.up('md')]: {
    top: 80,
  },
}));

const LegendBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 10,
  left: 10,
  zIndex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  maxWidth: '40%',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '80%',
    bottom: 70, // Give space for mobile controls
  },
}));

const LegendToggle = styled(Button)(({ theme }) => ({
  position: 'absolute',
  bottom: 10,
  left: 10,
  zIndex: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  minWidth: 'auto',
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
}));

interface MapVisualizationProps {
  title: string;
  layers: MapLayer[];
  legendItems: LegendItem[];
  visibleLayers: Record<string, boolean>;
  onToggleLayer: (layerId: string) => void;
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

const MapVisualization = ({
  title,
  layers,
  legendItems,
  visibleLayers,
  onToggleLayer,
  initialViewState = {
    longitude: -52.956841,
    latitude: -15.415179,
    zoom: 3.65,
  },
}: MapVisualizationProps) => {
  const mapRef = useRef<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(!isMobile);

  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Helper function to get fill color - simplified to return a valid string
  const getFillColorRules = (): string => {
    // Return a static color that's compatible with the expected type
    return '#4682B4'; // Steel blue color
  };

  // Layer definitions for fill and line
  const fillLayer: LayerProps = {
    id: 'fill-layer',
    type: 'fill',
    paint: {
      'fill-color': getFillColorRules(),
      'fill-opacity': 0.8,
    },
  };

  const lineLayer: LayerProps = {
    id: 'line-layer',
    type: 'line',
    paint: {
      'line-color': '#050505',
      'line-width': 0.5,
    },
  };

  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        height: '80vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Typography
        variant={isMobile ? 'subtitle1' : 'h6'}
        align="center"
        p={isMobile ? 1 : 2}
      >
        {title}
      </Typography>

      <MapContainer>
        <Map
          ref={mapRef}
          mapLib={import('maplibre-gl')}
          mapStyle="https://api.maptiler.com/maps/streets/style.json?key=tLpO7P2cZG0MPIqHCFYJ"
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
          touchZoomRotate={true}
          dragRotate={false}
        >
          {layers.map(
            layer =>
              visibleLayers[layer.id] && (
                <Source
                  key={layer.id}
                  id={layer.id}
                  type="geojson"
                  data={layer.geojson}
                >
                  <Layer {...fillLayer} id={`${layer.id}-fill`} />
                  <Layer {...lineLayer} id={`${layer.id}-line`} />
                </Source>
              ),
          )}

          {/* Desktop controls */}
          <ControlsContainer>
            <LayerControl
              layers={layers.map(l => ({ id: l.id, name: l.name }))}
              visibility={visibleLayers}
              onToggle={onToggleLayer}
            />
          </ControlsContainer>

          {/* Map controls positioned for better mobile experience */}
          <NavigationControl
            position={isMobile ? 'bottom-right' : 'top-right'}
            showCompass={false}
            style={{ marginRight: isMobile ? 80 : 10 }}
          />

          {/* Fullscreen button */}
          <FullscreenButton
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            size="small"
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </FullscreenButton>

          {/* Legend toggle button */}
          {isMobile && (
            <LegendToggle
              startIcon={<InfoIcon />}
              size="small"
              onClick={() => setShowLegend(!showLegend)}
              variant="outlined"
            >
              {showLegend ? 'Ocultar' : 'Legenda'}
            </LegendToggle>
          )}

          {/* Legend positioned at bottom left */}
          <Collapse in={showLegend} timeout={300}>
            <LegendBox>
              <MapLegend items={legendItems} />
            </LegendBox>
          </Collapse>
        </Map>

        {/* Mobile layers button */}
        <MobileFab
          color="primary"
          size="medium"
          onClick={() => setDrawerOpen(true)}
          aria-label="Show layers"
        >
          <LayersIcon />
        </MobileFab>

        {/* Mobile drawer for layer control */}
        <Drawer
          anchor="right"
          open={drawerOpen && isMobile}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: '80%',
              maxWidth: 300,
              borderTopLeftRadius: theme.shape.borderRadius,
              borderBottomLeftRadius: theme.shape.borderRadius,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Camadas do Mapa</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <LayerControl
              layers={layers.map(l => ({ id: l.id, name: l.name }))}
              visibility={visibleLayers}
              onToggle={onToggleLayer}
            />
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Legenda
            </Typography>
            <MapLegend items={legendItems} />
          </Box>
        </Drawer>
      </MapContainer>
    </Paper>
  );
};

export default MapVisualization;
