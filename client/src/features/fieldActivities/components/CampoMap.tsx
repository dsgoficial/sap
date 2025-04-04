import { useState, useRef, useCallback, useMemo } from 'react';
import { Box, Typography, CircularProgress, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel, Paper } from '@mui/material';
import Map, { Source, Layer, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useFieldActivities } from '@/hooks/useFieldActivities';
import FieldFeaturePopup from './FieldFeaturePopup';
import { useFieldActivitiesStore, selectSelectedTracks } from '@/stores/fieldActivitiesStore';

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
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Get data and actions from hooks
  const { 
    geoJsonData, 
    isLoadingGeoJson, 
    handleSelectCampo, 
    handleViewFotos,
    error 
  } = useFieldActivities();
  
  const selectedTracks = useFieldActivitiesStore(selectSelectedTracks);
  
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
      features: filteredFeatures
    };
  }, [geoJsonData, showAllCampos, selectedYear]);
  
  // Get available years from GeoJSON data
  const availableYears = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features) return [new Date().getFullYear()];
    
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
  
  // Handler for clicking on map
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
  
  // Returns a color for a track based on its index
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
      '#673AB7'  // Deep purple
    ];
    
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
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !geoJsonData) {
    return (
      <Typography color="error">
        Erro ao carregar dados para o mapa.
      </Typography>
    );
  }
  
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Filter controls */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
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
                disabled={showAllCampos}  // Adicione esta prop
              >
            {availableYears.map(year => (
            <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
              </Select>
          </FormControl>
        </Box>
      </Paper>
      
      {/* Map container */}
      <Box sx={{ width: '100%', height: '500px', position: 'relative' }} className={className}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: -47.6500,
            latitude: -27.25000,
            zoom: 4
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          onClick={handleMapClick}
          interactiveLayerIds={['campos-points']}
        >
          {/* Source for fields */}
          <Source 
            id="campos" 
            type="geojson" 
            data={filteredGeoJsonData as GeoJSON.FeatureCollection}
          >
            {/* Fill layer */}
            <Layer
    id="campos-points"
    type="circle"
    paint={{
      'circle-color': [
        'match',
        ['get', 'situacao'],
        'Previsto', '#2196F3',    // Blue
        'Em Execução', '#FFEB3B', // Yellow
        'Finalizado', '#4CAF50',  // Green
        'Cancelado', '#F44336',   // Red
        '#4CAF50'                 // Default color (green)
      ],
      'circle-radius': 8,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#000'
    }}
  />
</Source>
          
          {/* MVT sources for each selected track */}
          {showTracks && selectedTracks.map((trackId, index) => {
            const mvtUrl = `${window.location.origin}/api/campo/tracks/${trackId}/{z}/{x}/{y}.mvt`;
                      
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
                    'line-opacity': 0.8
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