// Path: features\map\components\LayerControl.tsx
import React, { useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  useTheme,
  Tooltip,
  alpha,
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

const LayerControl: React.FC<LayerControlProps> = ({
  layers,
  visibility,
  onToggle,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Memoize toggle handler to prevent recreation on each render
  const handleToggle = useCallback(
    (layerId: string) => {
      // Prevent event bubbling
      return (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(layerId);
      };
    },
    [onToggle],
  );

  if (layers.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        Nenhuma camada disponível
      </Typography>
    );
  }

  return (
    <div>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ color: theme.palette.text.primary, mb: 1 }}
      >
        Camadas
      </Typography>
      <List dense sx={{ width: '100%', pt: 0 }}>
        {layers.map(layer => (
          <ListItem key={layer.id} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleToggle(layer.id)}
              dense
              sx={{
                borderRadius: 1,
                py: 0.75,
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  checked={!!visibility[layer.id]}
                  tabIndex={-1}
                  disableRipple
                  size="small"
                  sx={{
                    color: isDarkMode
                      ? theme.palette.primary.light
                      : theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: isDarkMode
                        ? theme.palette.primary.light
                        : theme.palette.primary.main,
                    },
                  }}
                />
              </ListItemIcon>
              <Tooltip title={layer.name} placement="top" arrow>
                <ListItemText
                  primary={layer.name}
                  primaryTypographyProps={{
                    variant: 'body2',
                    noWrap: true,
                    sx: {
                      color: theme.palette.text.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                    },
                  }}
                />
              </Tooltip>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default React.memo(LayerControl);
