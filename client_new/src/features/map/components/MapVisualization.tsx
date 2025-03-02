// Path: features\map\components\MapVisualization.tsx
import { useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box } from '@mui/material';
import Map, { Source, Layer, LayerProps } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLegend from './MapLegend';
import LayerControl from './LayerControl';
import { MapLayer, LegendItem } from '@/types/map';

const MapContainer = styled(Box)({
  height: '70vh',
  position: 'relative',
});

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
      <Typography variant="h6" align="center" p={2}>
        {title}
      </Typography>

      <MapContainer>
        <Map
          ref={mapRef}
          mapLib={import('maplibre-gl')}
          mapStyle="https://api.maptiler.com/maps/streets/style.json?key=tLpO7P2cZG0MPIqHCFYJ"
          initialViewState={initialViewState}
          style={{ width: '100%', height: '100%' }}
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

          <ControlsContainer>
            <LayerControl
              layers={layers.map(l => ({ id: l.id, name: l.name }))}
              visibility={visibleLayers}
              onToggle={onToggleLayer}
            />
          </ControlsContainer>

          {/* Legend positioned at bottom left */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 1,
              padding: 1,
            }}
          >
            <MapLegend items={legendItems} />
          </Box>
        </Map>
      </MapContainer>
    </Paper>
  );
};

export default MapVisualization;
