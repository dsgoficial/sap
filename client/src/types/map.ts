// Path: types\map.ts

export interface MapLayer {
  id: string;
  name: string;
  geojson: GeoJSON.FeatureCollection;
  visible?: boolean;
}

export interface LegendItem {
  label: string;
  color: string;
  border: boolean;
}
