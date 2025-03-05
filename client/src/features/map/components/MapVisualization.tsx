// Path: features\map\components\MapVisualization.tsx
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
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
  Typography,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapLegend from './MapLegend';
import LayerControl from './LayerControl';
import { MapLayer, LegendItem } from '@/types/map';
import LayersIcon from '@mui/icons-material/Layers';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { getFeatureStyle } from '../utils/mapStyles';
import { formatDate } from '@/utils/formatters';

const MapContainerWrapper = styled(Box)(({ theme }) => ({
  height: '75vh',
  position: 'relative',
  overflow: 'hidden', // Prevent overflow
  [theme.breakpoints.down('sm')]: {
    height: '65vh',
  },
}));

const DesktopControlsPanel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 999,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.9)
      : 'rgba(255, 255, 255, 0.8)',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  maxHeight: 'calc(100% - 30px)',
  overflowY: 'auto',
  overflowX: 'hidden', // Prevent horizontal scrolling
  width: 280, // Increased from 200px
  maxWidth: '90%',
  boxShadow: theme.shadows[3],
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

const ControlButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  zIndex: 999,
  color: theme.palette.getContrastText(
    theme.palette.mode === 'dark' 
      ? theme.palette.primary.dark 
      : theme.palette.primary.main
  ),
  backgroundColor:
    theme.palette.mode === 'dark'
      ? theme.palette.primary.dark
      : theme.palette.primary.main,
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.primary.main
        : theme.palette.primary.dark,
  },
  fontWeight: 'bold',
  boxShadow: theme.shadows[2],
}));

const ZoomButton = styled(IconButton)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.7)
      : 'rgba(255, 255, 255, 0.7)',
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.9)
        : 'rgba(255, 255, 255, 0.9)',
  },
  margin: theme.spacing(0.5),
}));

const ZoomControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: 20,
  zIndex: 999,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    right: 10,
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

// Función para formatar nomes de camadas
const formatLayerName = (name: string): string => {
  if (name.startsWith('lote_')) {
    const lotNumber = name.split('_')[1];
    return `Lote ${lotNumber}`;
  }
  return name;
};

// Formata os nomes dos campos das propriedades
const formatFieldName = (key: string): string => {
  switch (key) {
    case 'mi': return 'MI';
    case 'inom': return 'INOM';
    case 'nome': return 'Nome';
    case 'tipo_produto': return 'Tipo de Produto';
    case 'denominador_escala': return 'Escala (1:)';
    case 'f_1_preparo_data_inicio': return 'Início Preparo';
    case 'f_1_preparo_data_fim': return 'Fim Preparo';
    case 'f_2_extracao_data_inicio': return 'Início Extração';
    case 'f_2_extracao_data_fim': return 'Fim Extração';
    case 'f_3_validacao_data_inicio': return 'Início Validação';
    case 'f_3_validacao_data_fim': return 'Fim Validação';
    case 'f_4_disseminacao_data_inicio': return 'Início Disseminação';
    case 'f_4_disseminacao_data_fim': return 'Fim Disseminação';
    default: return key;
  }
};

// Formata o valor das propriedades
const formatPropertyValue = (key: string, value: any): string => {
  if (value === '-' || value === null || value === undefined || value === '') {
    return '-';
  }
  
  if (key.includes('data_inicio') || key.includes('data_fim')) {
    return formatDate(value);
  }
  
  if (key === 'denominador_escala') {
    return value.toLocaleString();
  }
  
  return String(value);
};

// Filtra campos importantes para exibir no popup
const filterImportantFields = (properties: Record<string, any>): Record<string, any> => {
  const importantFields = [
    'mi', 'inom', 'tipo_produto', 'denominador_escala',
    'f_1_preparo_data_inicio', 'f_1_preparo_data_fim',
    'f_2_extracao_data_inicio', 'f_2_extracao_data_fim',
    'f_3_validacao_data_inicio', 'f_3_validacao_data_fim',
    'f_4_disseminacao_data_inicio', 'f_4_disseminacao_data_fim'
  ];
  
  const result: Record<string, any> = {};
  importantFields.forEach(field => {
    if (field in properties) {
      result[field] = properties[field];
    }
  });
  
  return result;
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
  const mapRef = useRef<L.Map | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(!isMobile);
  const [showLayers, setShowLayers] = useState(false); // New state for desktop layers panel
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [popupAnchorEl, setPopupAnchorEl] = useState<HTMLElement | null>(null);
  
  // Estado para controlar se o mapa foi inicialmente carregado
  const [initialZoomDone, setInitialZoomDone] = useState(false);

  // Create custom icon using inline SVG
  useEffect(() => {
    // Remove default icons
    // @ts-ignore - _getIconUrl exists in the implementation but not in the type definitions
    delete L.Icon.Default.prototype._getIconUrl;

    // Create custom SVG icon for markers
    const createSvgIcon = (color: string) => {
      const primaryColor = color || theme.palette.primary.main;
      
      // Create a custom icon using SVG as data URL
      const customIcon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
                <path fill="${primaryColor}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });
      
      return customIcon;
    };

    // Set the custom icon as default
    L.Marker.prototype.options.icon = createSvgIcon(theme.palette.primary.main);
    
  }, [theme.palette.primary.main]);

  // Memoized functions
  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const toggleLegend = useCallback(() => {
    setShowLegend(prev => !prev);
  }, []);

  const toggleLayers = useCallback(() => {
    setShowLayers(prev => !prev);
  }, []);

  // Zoom control functions
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  // Function to fit map bounds to all GeoJSON data
  const fitBoundsToData = useCallback(() => {
    if (!mapRef.current || layers.length === 0) return;
    
    try {
      // Create a bounds object
      const bounds = L.latLngBounds([]);
      
      // Add all visible layer bounds
      layers.forEach(layer => {
        if (visibleLayers[layer.id] && layer.geojson && layer.geojson.features) {
          const geoJsonLayer = L.geoJSON(layer.geojson);
          const layerBounds = geoJsonLayer.getBounds();
          
          // Only extend if bounds are valid
          if (layerBounds.isValid()) {
            bounds.extend(layerBounds);
          }
        }
      });
      
      // If we have valid bounds, fit the map to them
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 8 // Limitar o zoom para não aproximar demais
        });
      }
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [layers, visibleLayers]);

  // Create a style function for the GeoJSON layers
  const styleFunction = useCallback(
    (feature: any) => {
      return getFeatureStyle(feature, isDarkMode);
    },
    [isDarkMode]
  );

  // Handle click on a feature
  const onFeatureClick = useCallback((feature: any, event: any) => {
    if (feature?.properties) {
      setSelectedFeature(feature.properties);
      setPopupAnchorEl(event.originalEvent.target);
    }
  }, []);

  // Handle close popup
  const handleClosePopup = useCallback(() => {
    setSelectedFeature(null);
    setPopupAnchorEl(null);
  }, []);

  // Point to point event handler for each GeoJSON feature
  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    layer.on({
      click: (e) => {
        onFeatureClick(feature, e);
      }
    });
  }, [onFeatureClick]);

  // Memoize tile layer URL for dark/light mode
  const tileLayerUrl = useMemo(() => {
    // Use dark tiles for dark mode, normal tiles for light mode
    return isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
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

  // Memoize formatted layer names
  const formattedLayers = useMemo(() => {
    return layers.map(layer => ({
      id: layer.id,
      name: formatLayerName(layer.name)
    }));
  }, [layers]);

  // Memoize drawer contents to prevent recreation on each render
  const layerControlContent = useMemo(
    () => (
      <Box sx={{ minWidth: isMobile ? 'auto' : 250 }}>
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
            onClick={isMobile ? toggleDrawer : toggleLayers}
            aria-label="Fechar menu de camadas"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
          <LayerControl
            layers={formattedLayers}
            visibility={visibleLayers}
            onToggle={onToggleLayer}
          />
        </Box>
      </Box>
    ),
    [formattedLayers, visibleLayers, onToggleLayer, isMobile, toggleDrawer, toggleLayers],
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

  // Fit bounds only on initial load, not when visibility changes
  useEffect(() => {
    if (mapRef.current && layers.length > 0 && !initialZoomDone) {
      // Timeout allows the GeoJSON layers to be properly loaded
      setTimeout(() => {
        fitBoundsToData();
        setInitialZoomDone(true);
      }, 500);
    }
  }, [fitBoundsToData, layers, initialZoomDone]);

  return (
    <Paper
      elevation={1}
      sx={{
        width: '100%',
        height: 'max-content',
        position: 'relative',
        bgcolor: theme.palette.background.paper,
        transition: theme.transitions.create(
          ['background-color', 'box-shadow'],
          {
            duration: theme.transitions.duration.standard,
          },
        ),
        overflow: 'hidden', // Prevent overflow
      }}
    >
      <MapContainerWrapper>
        <MapContainer
          center={center}
          zoom={initialViewState.zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false} // Disable default zoom controls
          ref={mapRef}
          attributionControl={false}
          whenReady={() => {
            // Fit to bounds once the map is ready if not done yet
            if (!initialZoomDone) {
              setTimeout(() => {
                fitBoundsToData();
                setInitialZoomDone(true);
              }, 500);
            }
          }}
        >
          <TileLayer url={tileLayerUrl} />

          {/* Render each GeoJSON layer if visible */}
          {layers.map(
            layer =>
              visibleLayers[layer.id] && (
                <GeoJSON
                  key={layer.id}
                  data={layer.geojson}
                  style={styleFunction}
                  onEachFeature={onEachFeature}
                />
              ),
          )}

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
          </div>
        </MapContainer>

        {/* Custom zoom controls */}
        <ZoomControls>
          <ZoomButton onClick={handleZoomIn} aria-label="Zoom in" size="small">
            <AddIcon />
          </ZoomButton>
          <ZoomButton onClick={handleZoomOut} aria-label="Zoom out" size="small">
            <RemoveIcon />
          </ZoomButton>
        </ZoomControls>

        {/* Desktop controls - Now toggleable */}
        {!isMobile && showLayers && (
          <DesktopControlsPanel>
            {layerControlContent}
          </DesktopControlsPanel>
        )}

        {/* Desktop toggle buttons */}
        {!isMobile && (
          <>
            <ControlButton
              onClick={toggleLayers}
              startIcon={<LayersIcon />}
              size="small"
              variant="contained"
              sx={{
                top: 10,
                right: 10,
                py: 0.75,
                px: 1.5,
              }}
            >
              Camadas
            </ControlButton>
            
            <ControlButton
              onClick={toggleLegend}
              startIcon={<InfoIcon />}
              size="small"
              variant="contained"
              color="secondary"
              sx={{
                bottom: showLegend ? 'auto' : 10, // Move button up when legend is shown
                top: showLegend ? 10 : 'auto',
                left: 10,
                py: 0.75,
                px: 1.5,
              }}
            >
              {showLegend ? 'Ocultar Legenda' : 'Mostrar Legenda'}
            </ControlButton>
          </>
        )}

        {/* Mobile toggle for legend */}
        {isMobile && (
          <ControlButton
            onClick={toggleLegend}
            startIcon={<InfoIcon />}
            size="small"
            color="secondary"
            sx={{
              bottom: showLegend ? 'auto' : 10, // Move button up when legend is shown
              top: showLegend ? 10 : 'auto',
              left: 10,
            }}
          >
            {showLegend ? 'Ocultar' : 'Legenda'}
          </ControlButton>
        )}

        {/* Legend positioned at bottom left */}
        <Collapse in={showLegend} timeout={300}>
          <LegendBox>
            <MapLegend items={legendItems} />
          </LegendBox>
        </Collapse>

        {/* Mobile layers button */}
        {isMobile && (
          <Fab
            color="primary"
            size="medium"
            onClick={toggleDrawer}
            aria-label="Show layers"
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 70, // Move away from zoom controls
              zIndex: 999,
            }}
          >
            <LayersIcon />
          </Fab>
        )}

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
          {layerControlContent}
        </Drawer>
        
        {/* Feature info popup */}
        <Popover
          open={Boolean(selectedFeature)}
          anchorEl={popupAnchorEl}
          onClose={handleClosePopup}
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
              maxHeight: 400,
              overflow: 'auto',
              bgcolor: theme.palette.background.paper,
            }
          }}
        >
          {selectedFeature && (
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Informações da Camada
              </Typography>
              <Table size="small">
                <TableBody>
                  {Object.entries(filterImportantFields(selectedFeature)).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ 
                          fontWeight: 'bold',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          p: 1
                        }}
                      >
                        {formatFieldName(key)}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          p: 1
                        }}
                      >
                        {formatPropertyValue(key, value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button size="small" onClick={handleClosePopup}>Fechar</Button>
              </Box>
            </Box>
          )}
        </Popover>
      </MapContainerWrapper>
    </Paper>
  );
};

export default React.memo(MapVisualization);