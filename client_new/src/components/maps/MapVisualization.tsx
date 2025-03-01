// Path: components\maps\MapVisualization.tsx
import { useEffect, useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box } from '@mui/material';
import Map, { Source, Layer, LayerProps } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapLegend from './MapLegend';
import LayerControl from './LayerControl';

export interface MapLayer {
  id: string;
  name: string;
  geojson: GeoJSON.FeatureCollection;
}

interface MapVisualizationProps {
  title: string;
  layers: MapLayer[];
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
}

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

export const MapVisualization = ({
  title,
  layers,
  initialViewState = {
    longitude: -52.956841,
    latitude: -15.415179,
    zoom: 3.65
  }
}: MapVisualizationProps) => {
  const mapRef = useRef<any>(null);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});
  
  // Initialize layer visibility
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    layers.forEach(layer => {
      initialVisibility[layer.id] = true;
    });
    setLayerVisibility(initialVisibility);
  }, [layers]);
  
  // Helper function to get fill color rules
  const getFillColorRules = (fieldPrefix: string = 'f') => {
    // Simplified implementation
    return [
      'case',
      ['all', 
        ['!=', ['get', `${fieldPrefix}_1_preparo_data_inicio`], null], 
        ['==', ['get', `${fieldPrefix}_1_preparo_data_fim`], null]
      ],
      'rgb(175,141,195)',
      ['all', 
        ['!=', ['get', `${fieldPrefix}_2_extracao_data_inicio`], null], 
        ['==', ['get', `${fieldPrefix}_2_extracao_data_fim`], null]
      ],
      'rgb(252,141,89)',
      ['all', 
        ['!=', ['get', `${fieldPrefix}_3_validacao_data_inicio`], null], 
        ['==', ['get', `${fieldPrefix}_3_validacao_data_fim`], null]
      ],
      'rgb(255,255,191)',
      ['all', 
        ['!=', ['get', `${fieldPrefix}_4_disseminacao_data_inicio`], null], 
        ['==', ['get', `${fieldPrefix}_4_disseminacao_data_fim`], null]
      ],
      'rgb(145,207,96)',
      ['all', 
        ['!=', ['get', `${fieldPrefix}_1_preparo_data_fim`], null],
        ['!=', ['get', `${fieldPrefix}_2_extracao_data_fim`], null],
        ['!=', ['get', `${fieldPrefix}_3_validacao_data_fim`], null],
        ['!=', ['get', `${fieldPrefix}_4_disseminacao_data_fim`], null]
      ],
      'rgb(26,152,80)',
      '#607d8b'
    ];
  };
  
  // Layer definitions
  const fillLayer: LayerProps = {
    id: 'fill-layer',
    type: 'fill',
    paint: {
      'fill-color': getFillColorRules(),
      'fill-opacity': 0.8
    }
  };
  
  const lineLayer: LayerProps = {
    id: 'line-layer',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['all', 
          ['!=', ['get', 'f_1_preparo_data_inicio'], null], 
          ['==', ['get', 'f_1_preparo_data_fim'], null]
        ],
        '#FF0000',
        ['all', 
          ['!=', ['get', 'f_2_extracao_data_inicio'], null], 
          ['==', ['get', 'f_2_extracao_data_fim'], null]
        ],
        '#FF0000',
        '#050505'
      ],
      'line-width': [
        'case',
        ['all', 
          ['!=', ['get', 'f_1_preparo_data_inicio'], null], 
          ['==', ['get', 'f_1_preparo_data_fim'], null]
        ],
        5,
        ['all', 
          ['!=', ['get', 'f_2_extracao_data_inicio'], null], 
          ['==', ['get', 'f_2_extracao_data_fim'], null]
        ],
        5,
        0.5
      ]
    }
  };
  
  // Toggle layer visibility
  const toggleLayerVisibility = (layerId: string) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };
  
  return (
    <Paper elevation={1} sx={{ width: '100%', height: '80vh', overflow: 'hidden', position: 'relative' }}>
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
          {layers.map(layer => (
            layerVisibility[layer.id] && (
              <Source key={layer.id} id={layer.id} type="geojson" data={layer.geojson}>
                <Layer {...fillLayer} id={`${layer.id}-fill`} />
                <Layer {...lineLayer} id={`${layer.id}-line`} />
              </Source>
            )
          ))}
          
          <ControlsContainer>
            <LayerControl 
              layers={layers.map(l => ({ id: l.id, name: l.name }))}
              visibility={layerVisibility}
              onToggle={toggleLayerVisibility}
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
              padding: 1
            }}
          >
            <MapLegend />
          </Box>
        </Map>
      </MapContainer>
    </Paper>
  );
};