// Path: features\map\components\LayerControl.tsx
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
} from '@mui/material';

interface LayerInfo {
  id: string;
  name: string;
}

interface LayerControlProps {
  layers: LayerInfo[];
  visibility: Record<string, boolean>;
  onToggle: (layerId: string) => void;
}

const LayerControl = ({ layers, visibility, onToggle }: LayerControlProps) => {
  return (
    <>
      <Typography variant="subtitle2" gutterBottom>
        Layers
      </Typography>
      <List dense sx={{ pt: 0 }}>
        {layers.map(layer => (
          <ListItem key={layer.id} disablePadding>
            <ListItemButton onClick={() => onToggle(layer.id)} dense>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  checked={!!visibility[layer.id]}
                  tabIndex={-1}
                  disableRipple
                  size="small"
                />
              </ListItemIcon>
              <ListItemText
                primary={layer.name}
                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default LayerControl;
