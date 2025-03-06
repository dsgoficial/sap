// Path: features\map\components\MapVisualization.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Typography,
  Drawer,
  Divider,
  Collapse,
  alpha,
} from '@mui/material';
import Map, {
  Layer,
  Source,
  NavigationControl,
  MapRef,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import MapLegend from './MapLegend';
import LayerControl from './LayerControl';
import FeaturePopup from './FeaturePopup';
import MapControls from './MapControls';
import { MapLayer, LegendItem } from '@/types/map';
import CloseIcon from '@mui/icons-material/Close';
import { getFillLayerPaint, getLineLayerPaint } from '../utils/mapStyles';

// Main container - important for setting overall height constraints
const RootContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 'auto',
  maxHeight: '80vh', // Set a maximum height
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden', // Prevent overflow at the root level
  backgroundColor: theme.palette.background.paper,
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),
  borderRadius: theme.shape.borderRadius,
}));

// Outer container for map and sidebar
const OuterContainer = styled(Box)({
  display: 'flex',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  flexGrow: 1, // Fill available space in parent
});

// Map container
const MapContainer = styled(Box)(({ theme }) => ({
  height: '70vh', // Slightly reduced from original 75vh
  maxHeight: '70vh',
  position: 'relative',
  overflow: 'hidden',
  flexGrow: 1,
  [theme.breakpoints.down('sm')]: {
    height: '60vh',
    maxHeight: '60vh',
  },
}));

// Sidebar for layer controls
const Sidebar = styled(Box, {
  shouldForwardProp: prop => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  width: open ? 280 : 0,
  flexShrink: 0,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  marginRight: open ? theme.spacing(2) : 0,
  height: 'auto', // Changed from fixed height
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    display: 'none', // Hide on mobile
  },
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowY: 'auto',
  flexGrow: 1,
}));

const LegendBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 60, // Space for navigation controls
  left: 10,
  zIndex: 1,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.9)
      : alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  maxWidth: '40%',
  maxHeight: '40%', // Limit height to prevent overflow
  overflowY: 'auto', // Add scroll for tall legends
  boxShadow: theme.shadows[3],
  [theme.breakpoints.down('sm')]: {
    maxWidth: '80%',
    bottom: 100, // Give more space on mobile
    maxHeight: '30%', // Smaller on mobile
  },
}));

interface MapVisualizationProps {
  title?: string;
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

// Format layer name
const formatLayerName = (name: string): string => {
  if (name.startsWith('lote_')) {
    const lotNumber = name.split('_')[1];
    return `Lote ${lotNumber}`;
  }
  return name;
};

const MapVisualization = ({
  layers,
  legendItems,
  visibleLayers,
  onToggleLayer,
  initialViewState = {
    longitude: -54.5,
    latitude: -14.5,
    zoom: 4,
  },
}: MapVisualizationProps) => {
  const mapRef = useRef<MapRef>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Component state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(!isMobile);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [popupAnchorEl, setPopupAnchorEl] = useState<HTMLElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Toggle handlers
  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const toggleLegend = useCallback(() => {
    setShowLegend(prev => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Close popup
  const handleClosePopup = useCallback(() => {
    setSelectedFeature(null);
    setPopupAnchorEl(null);
  }, []);

  // Handle click on the map
  const handleMapClick = useCallback((event: any) => {
    if (!mapRef.current) return;

    // Get features at click point
    const features = mapRef.current.queryRenderedFeatures(event.point);

    if (features.length > 0) {
      const feature = features[0];
      if (feature.properties) {
        setSelectedFeature(feature.properties);
        setPopupAnchorEl(event.originalEvent.target);
      }
    }
  }, []);

  // Fit bounds to data
  const fitBoundsToData = useCallback(() => {
    if (!mapRef.current || layers.length === 0 || !mapLoaded) return;

    try {
      const visibleLayerIds = Object.entries(visibleLayers)
        .filter(([_, isVisible]) => isVisible)
        .map(([id]) => id);

      if (visibleLayerIds.length === 0) return;

      // Create a combined bounds from all visible layers
      let combinedBounds: [[number, number], [number, number]] | null = null;

      visibleLayerIds.forEach(layerId => {
        const layer = layers.find(l => l.id === layerId);
        if (
          !layer ||
          !layer.geojson ||
          !layer.geojson.features ||
          layer.geojson.features.length === 0
        ) {
          return;
        }

        layer.geojson.features.forEach(feature => {
          if (!feature.geometry) return;

          // Handle different geometry types
          if (
            feature.geometry.type === 'Point' &&
            feature.geometry.coordinates
          ) {
            const [lng, lat] = feature.geometry.coordinates;
            if (!combinedBounds) {
              combinedBounds = [
                [lng, lat],
                [lng, lat],
              ];
            } else {
              combinedBounds[0][0] = Math.min(combinedBounds[0][0], lng);
              combinedBounds[0][1] = Math.min(combinedBounds[0][1], lat);
              combinedBounds[1][0] = Math.max(combinedBounds[1][0], lng);
              combinedBounds[1][1] = Math.max(combinedBounds[1][1], lat);
            }
          }
          // Handle other geometry types (polygons, lines, etc.)
          else if (feature.bbox) {
            const [minX, minY, maxX, maxY] = feature.bbox;
            if (!combinedBounds) {
              combinedBounds = [
                [minX, minY],
                [maxX, maxY],
              ];
            } else {
              combinedBounds[0][0] = Math.min(combinedBounds[0][0], minX);
              combinedBounds[0][1] = Math.min(combinedBounds[0][1], minY);
              combinedBounds[1][0] = Math.max(combinedBounds[1][0], maxX);
              combinedBounds[1][1] = Math.max(combinedBounds[1][1], maxY);
            }
          }
        });
      });

      if (combinedBounds) {
        mapRef.current.fitBounds(combinedBounds, {
          padding: 50,
          maxZoom: 8,
        });
      }
    } catch (error) {
      console.error('Error fitting bounds:', error);
    }
  }, [layers, visibleLayers, mapLoaded]);

  // Memoize formatted layer names
  const formattedLayers = useMemo(() => {
    return layers.map(layer => ({
      id: layer.id,
      name: formatLayerName(layer.name),
    }));
  }, [layers]);

  // Generate map style URL based on dark/light mode
  const mapStyle = useMemo(() => {
    return isDarkMode
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  }, [isDarkMode]);

  // Handle map load
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  // Effect to fit bounds when layers change or become visible
  useEffect(() => {
    if (mapLoaded) {
      fitBoundsToData();
    }
  }, [fitBoundsToData, mapLoaded]);

  // Mobile drawer content for layer controls
  const mobileDrawerContent = useMemo(
    () => (
      <Box sx={{ minWidth: 'auto', maxWidth: 300 }}>
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
        <Box
          sx={{
            p: 2,
            maxHeight: '70vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <LayerControl
            layers={formattedLayers}
            visibility={visibleLayers}
            onToggle={onToggleLayer}
          />
        </Box>
      </Box>
    ),
    [formattedLayers, visibleLayers, onToggleLayer, toggleDrawer],
  );

  return (
    <RootContainer elevation={1}>
      <OuterContainer>
        {/* Sidebar for layer controls (desktop only) */}
        <Sidebar open={sidebarOpen}>
          <SidebarHeader>
            <Typography variant="h6">Camadas do Mapa</Typography>
            <IconButton
              onClick={toggleSidebar}
              aria-label="Fechar painel de camadas"
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </SidebarHeader>
          <SidebarContent>
            <LayerControl
              layers={formattedLayers}
              visibility={visibleLayers}
              onToggle={onToggleLayer}
            />
          </SidebarContent>
        </Sidebar>

        {/* Map container */}
        <MapContainer>
          <Map
            ref={mapRef}
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyle}
            onClick={handleMapClick}
            attributionControl={false}
            onLoad={handleMapLoad}
            interactiveLayerIds={layers.map(layer => `${layer.id}-fill`)}
          >
            {/* Render map sources and layers */}
            {layers.map(layer => {
              const isVisible = visibleLayers[layer.id] || false;

              // Generate layer ID for this source
              const fillLayerId = `${layer.id}-fill`;
              const lineLayerId = `${layer.id}-line`;

              return (
                <Source
                  key={layer.id}
                  id={layer.id}
                  type="geojson"
                  data={layer.geojson}
                >
                  {/* Fill layer with styling from mapStyles.ts */}
                  <Layer
                    id={fillLayerId}
                    type="fill"
                    paint={getFillLayerPaint(isDarkMode, isVisible)}
                  />

                  {/* Line layer with styling from mapStyles.ts */}
                  <Layer
                    id={lineLayerId}
                    type="line"
                    paint={getLineLayerPaint(isDarkMode, isVisible)}
                  />
                </Source>
              );
            })}

            {/* Navigation controls */}
            <NavigationControl position="bottom-right" />
          </Map>

          {/* Map Controls Component */}
          <MapControls
            onToggleLegend={toggleLegend}
            onToggleDrawer={toggleDrawer}
            onToggleSidebar={toggleSidebar}
            showLegend={showLegend}
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
          />

          {/* Legend */}
          <Collapse in={showLegend} timeout={300}>
            <LegendBox>
              <MapLegend items={legendItems} />
            </LegendBox>
          </Collapse>

          {/* Feature Popup Component */}
          <FeaturePopup
            selectedFeature={selectedFeature}
            anchorEl={popupAnchorEl}
            onClose={handleClosePopup}
          />
        </MapContainer>
      </OuterContainer>

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
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    </RootContainer>
  );
};

export default React.memo(MapVisualization);
