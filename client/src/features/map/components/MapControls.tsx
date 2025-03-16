// Path: features\map\components\MapControls.tsx
import React from 'react';
import { Button, IconButton, useTheme, styled } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import LayersIcon from '@mui/icons-material/Layers';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface MapControlsProps {
  onToggleLegend: () => void;
  onToggleDrawer?: () => void;
  onToggleSidebar?: () => void;
  showLegend: boolean;
  isMobile: boolean;
  sidebarOpen: boolean;
}

const ControlButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,
  color: theme.palette.getContrastText(
    theme.palette.mode === 'dark'
      ? theme.palette.primary.dark
      : theme.palette.primary.main,
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

const MapControls: React.FC<MapControlsProps> = ({
  onToggleLegend,
  onToggleDrawer,
  onToggleSidebar,
  showLegend,
  isMobile,
  sidebarOpen,
}) => {
  const theme = useTheme();

  return (
    <>
      {/* Legend toggle button - at bottom left */}
      <ControlButton
        onClick={onToggleLegend}
        startIcon={<InfoIcon />}
        size="small"
        variant="contained"
        color="secondary"
        sx={{
          bottom: 10,
          left: 10,
        }}
      >
        {showLegend ? 'Ocultar Legenda' : 'Mostrar Legenda'}
      </ControlButton>

      {/* Mobile layers button */}
      {isMobile && onToggleDrawer && (
        <IconButton
          color="primary"
          size="medium"
          onClick={onToggleDrawer}
          aria-label="Show layers"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[2],
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <LayersIcon />
        </IconButton>
      )}

      {/* Sidebar toggle button for desktop */}
      {!isMobile && !sidebarOpen && onToggleSidebar && (
        <Button
          variant="contained"
          onClick={onToggleSidebar}
          startIcon={<ChevronRightIcon />}
          size="small"
          sx={{
            position: 'absolute',
            left: 0,
            top: 10,
            zIndex: 10,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          Camadas
        </Button>
      )}
    </>
  );
};

export default React.memo(MapControls);
