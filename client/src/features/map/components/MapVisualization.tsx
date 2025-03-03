// Path: features\map\components\MapVisualization.tsx
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
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
  alpha,
} from '@mui/material';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapLegend from './MapLegend';
import LayerControl from './LayerControl';
import { MapLayer, LegendItem } from '@/types/map';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const MapContainerWrapper = styled(Box)(({ theme }) => ({
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
  zIndex: 999,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.9)
      : 'rgba(255, 255, 255, 0.8)',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  maxHeight: 'calc(100% - 30px)',
  overflowY: 'auto',
  width: 200,
  display: 'none', // Hide on mobile, will use drawer instead
  [theme.breakpoints.up('md')]: {
    display: 'block',
  },
  boxShadow: theme.shadows[3],
}));

const MobileFab = styled(Fab)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: 20,
  zIndex: 999,
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const FullscreenButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 999,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : 'rgba(255, 255, 255, 0.8)',
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.9)
        : 'rgba(255, 255, 255, 0.9)',
  },
  [theme.breakpoints.up('md')]: {
    top: 80,
  },
}));

const LegendBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 10,
  left: 10,
  zIndex: 999,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.9)
      : 'rgba(255, 255, 255, 0.8)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  maxWidth: '40%',
  boxShadow: theme.shadows[3],
  [theme.breakpoints.down('sm')]: {
    maxWidth: '80%',
    bottom: 70, // Give space for mobile controls
  },
}));

const LegendToggle = styled(Button)(({ theme }) => ({
  position: 'absolute',
  bottom: 10,
  left: 10,
  zIndex: 999,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : 'rgba(255, 255, 255, 0.8)',
  minWidth: 'auto',
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.9)
        : 'rgba(255, 255, 255, 0.9)',
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
  const mapRef = useRef<L.Map | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(!isMobile);

  // Fix Leaflet's default icon paths
  useEffect(() => {
    // Fix for the TypeScript error - using type assertion to tell TypeScript
    // that we know what we're doing with the internal property
    // @ts-ignore - _getIconUrl exists in the implementation but not in the type definitions
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // Memoized functions
  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const toggleLegend = useCallback(() => {
    setShowLegend(prev => !prev);
  }, []);

  // Function to toggle fullscreen - memoized
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  // Style function for GeoJSON - memoized to prevent recreation on every render
  const layerStyle = useMemo(() => {
    return {
      fillColor: isDarkMode ? '#5A8CBA' : '#4682B4', // Adjusted for dark mode
      weight: 0.5,
      opacity: 1,
      color: isDarkMode ? '#CCCCCC' : '#050505', // Lighter border in dark mode
      fillOpacity: isDarkMode ? 0.6 : 0.8, // Adjusted opacity for dark mode
    };
  }, [isDarkMode]);

  // Memoize tile layer URL for dark/light mode
  const tileLayerUrl = useMemo(() => {
    // Use dark tiles for dark mode, normal tiles for light mode
    return isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }, [isDarkMode]);

  // Memoize tile layer attribution
  const tileAttribution = useMemo(() => {
    return isDarkMode
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  }, [isDarkMode]);

  // Memoize center coordinates
  const center = useMemo(
    () =>
      [initialViewState.latitude, initialViewState.longitude] as [
        number,
        number,
      ],
    [initialViewState.latitude, initialViewState.longitude],
  );

  // Memoize drawer contents to prevent recreation on each render
  const drawerContent = useMemo(
    () => (
      <>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">Camadas do Mapa</Typography>
          <IconButton
            onClick={toggleDrawer}
            aria-label="Fechar menu de camadas"
          >
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
      </>
    ),
    [layers, visibleLayers, onToggleLayer, legendItems, toggleDrawer],
  );

  // Update map when the theme changes
  useEffect(() => {
    if (mapRef.current) {
      // Force a redraw by invalidating the map size
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 0);
    }
  }, [isDarkMode]);

  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        height: '80vh',
        overflow: 'hidden',
        position: 'relative',
        bgcolor: theme.palette.background.paper,
        transition: theme.transitions.create(
          ['background-color', 'box-shadow'],
          {
            duration: theme.transitions.duration.standard,
          },
        ),
      }}
    >
      <Typography
        variant={isMobile ? 'subtitle1' : 'h6'}
        align="center"
        p={isMobile ? 1 : 2}
      >
        {title}
      </Typography>

      <MapContainerWrapper>
        <MapContainer
          center={center}
          zoom={initialViewState.zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          ref={mapRef}
          attributionControl={false} // We'll add attribution control separately for better styling
        >
          <TileLayer attribution={tileAttribution} url={tileLayerUrl} />

          {/* Render each GeoJSON layer if visible */}
          {layers.map(
            layer =>
              visibleLayers[layer.id] && (
                <GeoJSON
                  key={layer.id}
                  data={layer.geojson}
                  style={layerStyle}
                />
              ),
          )}

          {/* Add Zoom Control in a better position for mobile */}
          <ZoomControl position={isMobile ? 'bottomright' : 'topright'} />

          {/* Add attribution with proper styling */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              zIndex: 1000,
              fontSize: '10px',
              padding: '1px 5px',
              background: isDarkMode
                ? 'rgba(0,0,0,0.5)'
                : 'rgba(255,255,255,0.5)',
              color: isDarkMode ? '#ccc' : '#333',
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: tileAttribution }} />
          </div>
        </MapContainer>

        {/* Desktop controls */}
        <ControlsContainer>
          <LayerControl
            layers={layers.map(l => ({ id: l.id, name: l.name }))}
            visibility={visibleLayers}
            onToggle={onToggleLayer}
          />
        </ControlsContainer>

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
            onClick={toggleLegend}
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

        {/* Mobile layers button */}
        <MobileFab
          color="primary"
          size="medium"
          onClick={toggleDrawer}
          aria-label="Show layers"
        >
          <LayersIcon />
        </MobileFab>

        {/* Mobile drawer for layer control */}
        <Drawer
          anchor="right"
          open={drawerOpen && isMobile}
          onClose={toggleDrawer}
          PaperProps={{
            sx: {
              width: '80%',
              maxWidth: 300,
              borderTopLeftRadius: theme.shape.borderRadius,
              borderBottomLeftRadius: theme.shape.borderRadius,
              bgcolor: theme.palette.background.paper, // Ensure proper background color
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </MapContainerWrapper>
    </Paper>
  );
};

export default React.memo(MapVisualization);
