// Path: features\fieldActivities\components\CampoMap.tsx
import { useState, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import Map, {
  Source,
  Layer,
  NavigationControl,
  MapRef,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFieldActivities } from '@/hooks/useFieldActivities';
import FieldFeaturePopup from './FieldFeaturePopup';
import {
  useFieldActivitiesStore,
  selectSelectedTracks,
} from '@/stores/fieldActivitiesStore';
import { useTheme } from '@mui/material/styles';

interface CampoMapProps {
  className?: string;
}

const CampoMap = ({ className }: CampoMapProps) => {
  // Refs
  const mapRef = useRef<MapRef>(null);

  // Local state
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [popupAnchorEl, setPopupAnchorEl] = useState<HTMLElement | null>(null);
  const [showAllCampos, setShowAllCampos] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  // Get data and actions from hooks
  const {
    geoJsonData,
    isLoadingGeoJson,
    handleSelectCampo,
    handleViewFotos,
    error,
  } = useFieldActivities();

  const selectedTracks = useFieldActivitiesStore(selectSelectedTracks);

  // Get theme to support dark mode
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Generate map style URL based on dark/light mode
  const mapStyle = useMemo(() => {
    return isDarkMode
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  }, [isDarkMode]);

  // Filter GeoJSON features by year
  const filteredGeoJsonData = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features || showAllCampos) {
      return geoJsonData;
    }

    // Filter features by the selected year
    const filteredFeatures = geoJsonData.features.filter(feature => {
      const properties = feature.properties;
      if (!properties || !properties.pit) return false;

      // PIT is always a valid year in YYYY format
      const pitYear = parseInt(properties.pit, 10);
      return pitYear === selectedYear;
    });

    // Return new GeoJSON object with filtered features
    return {
      ...geoJsonData,
      features: filteredFeatures,
    };
  }, [geoJsonData, showAllCampos, selectedYear]);

  // Get available years from GeoJSON data
  const availableYears = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features)
      return [new Date().getFullYear()];

    const yearsSet = new Set<number>();
    const currentYear = new Date().getFullYear();
    yearsSet.add(currentYear); // Always include current year

    geoJsonData.features.forEach(feature => {
      const properties = feature.properties;
      if (!properties || !properties.pit) return;

      // PIT is always a valid year in YYYY format
      const pitYear = parseInt(properties.pit, 10);
      if (!isNaN(pitYear)) {
        yearsSet.add(pitYear);
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending (newest first)
  }, [geoJsonData]);

  const handleMapClick = useCallback((event: any) => {
    if (!mapRef.current) return;

    // Get features from both campos-points and campos-polygons layers
    const features = mapRef.current.queryRenderedFeatures(event.point, {
      layers: ['campos-points', 'campos-polygons']
    });

    if (features.length > 0) {
      const feature = features[0];
      if (feature.properties) {
        setSelectedFeature(feature.properties);
        setPopupAnchorEl(event.originalEvent.target);
      }
    } else {
      // Se clicou fora de uma feição, fecha o popup
      setSelectedFeature(null);
      setPopupAnchorEl(null);
    }
  }, []);

  // Close popup
  const handleClosePopup = useCallback(() => {
    // Desfoque qualquer elemento focado antes de fechar
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Use setTimeout para permitir que o foco seja movido antes de remover o elemento
    setTimeout(() => {
      setSelectedFeature(null);
      setPopupAnchorEl(null);
    }, 0);
  }, []);

  // Check if showing tracks
  const showTracks = selectedTracks.length > 0;

  const getTrackColor = useCallback((index: number) => {
    const colors = [
      '#FF5722', // Orange
      '#2196F3', // Blue
      '#9C27B0', // Purple
      '#F44336', // Red
      '#4CAF50', // Green
      '#FFEB3B', // Yellow
      '#03A9F4', // Light blue
      '#E91E63', // Pink
      '#009688', // Teal
      '#673AB7', // Deep purple
      '#FF9800', // Dark Orange
      '#CDDC39', // Lime
      '#607D8B', // Blue Grey
      '#795548', // Brown
      '#8BC34A', // Light Green
      '#00BCD4', // Cyan
      '#F06292', // Pink 300
      '#BA68C8', // Purple 300
      '#7986CB', // Indigo 300
      '#4DD0E1', // Cyan 300
      '#4DB6AC', // Teal 300
      '#81C784', // Green 300
      '#DCE775', // Lime 300
      '#FFD54F', // Amber 300
      '#FF8A65', // Deep Orange 300
      '#90A4AE', // Blue Grey 300
      '#A1887F', // Brown 300
      '#E57373', // Red 300
      '#64B5F6', // Blue 300
      '#F06292'  // Pink 300
    ];

    // Função hash básica para converter trackId para um índice de cor
    // Usa o índice diretamente para manter compatibilidade
    return colors[index % colors.length];
  }, []);

  // Handle year selection change
  const handleYearChange = (event: any) => {
    setSelectedYear(Number(event.target.value));
  };

  // Handle show all checkbox change
  const handleShowAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAllCampos(event.target.checked);
  };

  if (isLoadingGeoJson) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !geoJsonData) {
    return (
      <Typography color="error">Erro ao carregar dados para o mapa.</Typography>
    );
  }

  return (
    <Box
      sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {/* Filter controls */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={showAllCampos}
                onChange={handleShowAllChange}
                color="primary"
              />
            }
            label="Mostrar todos os campos"
          />

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="year-select-label">Ano</InputLabel>
            <Select
              labelId="year-select-label"
              id="year-select"
              value={selectedYear}
              label="Ano"
              onChange={handleYearChange}
              disabled={showAllCampos}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Map container */}
      <Box
        sx={{ width: '100%', height: '500px', position: 'relative' }}
        className={className}
      >
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: -47.65,
            latitude: -27.25,
            zoom: 4,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapStyle}
          onClick={handleMapClick}
          interactiveLayerIds={['campos-points', 'campos-polygons']} // Adicionado campos-polygons como interativo
        >
          {/* Source for fields */}
          <Source
            id="campos"
            type="geojson"
            data={filteredGeoJsonData as GeoJSON.FeatureCollection}
          >
            {/* Polygon layer - NOVA CAMADA */}
            <Layer
              id="campos-polygons"
              type="fill"
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'situacao'],
                  'Previsto',
                  'rgba(33, 150, 243, 0.3)', // Blue with opacity
                  'Em Execução',
                  'rgba(255, 235, 59, 0.3)', // Yellow with opacity
                  'Finalizado',
                  'rgba(76, 175, 80, 0.3)', // Green with opacity
                  'Cancelado',
                  'rgba(244, 67, 54, 0.3)', // Red with opacity
                  'rgba(76, 175, 80, 0.3)', // Default color (green with opacity)
                ],
                'fill-outline-color': isDarkMode ? '#ffffff' : '#000000',
              }}
            />
            
            {/* Points layer - MANTIDA */}
            <Layer
              id="campos-points"
              type="circle"
              paint={{
                'circle-color': [
                  'match',
                  ['get', 'situacao'],
                  'Previsto',
                  '#2196F3', // Blue
                  'Em Execução',
                  '#FFEB3B', // Yellow
                  'Finalizado',
                  '#4CAF50', // Green
                  'Cancelado',
                  '#F44336', // Red
                  '#4CAF50', // Default color (green)
                ],
                'circle-radius': 8,
                'circle-stroke-width': 1,
                'circle-stroke-color': isDarkMode ? '#ffffff' : '#000000',
              }}
            />
          </Source>

          {/* MVT sources for each selected track */}
          {showTracks &&
            selectedTracks.map((trackId, index) => {
              const mvtUrl = `${window.location.origin}/campo/tracks/${trackId}/{z}/{x}/{y}.mvt`;

              return (
                <Source
                  key={trackId}
                  id={`track-source-${trackId}`}
                  type="vector"
                  tiles={[mvtUrl]}
                >
                  <Layer
                    id={`track-layer-${trackId}`}
                    type="line"
                    source={`track-source-${trackId}`}
                    source-layer="track_layer"
                    paint={{
                      'line-color': getTrackColor(index),
                      'line-width': 3,
                      'line-opacity': 0.8,
                    }}
                  />
                </Source>
              );
            })}

          {/* Navigation controls */}
          <NavigationControl position="bottom-right" />
        </Map>

        {/* Popup for field details */}
        <FieldFeaturePopup
          selectedFeature={selectedFeature}
          anchorEl={popupAnchorEl}
          onClose={handleClosePopup}
          onViewDetails={handleSelectCampo}
          onViewFotos={handleViewFotos}
        />
      </Box>
    </Box>
  );
};

export default CampoMap;
