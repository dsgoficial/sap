// Path: features\map\components\LayerControl.tsx
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ color: theme.palette.text.primary }}
      >
        Camadas
      </Typography>
      <List dense sx={{ pt: 0 }}>
        {layers.map(layer => (
          <ListItem key={layer.id} disablePadding>
            <ListItemButton
              onClick={() => onToggle(layer.id)}
              dense
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
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
    </>
  );
};

export default LayerControl;