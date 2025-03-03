// Path: components\layouts\AppNavbar.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
  Avatar,
  useMediaQuery,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuthStore, selectUsername } from '@/stores/authStore';
import { AuthStatus } from '@/features/auth/components/AuthStatus';
import { useThemeMode } from '@/contexts/ThemeContext';

interface DashboardNavbarProps {
  onOpenSidebar: () => void;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: theme.shadows[3],
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(33, 43, 54, 0.9)' // Dark background for dark mode
      : 'rgba(255, 255, 255, 0.95)', // Light background for light mode
  color: theme.palette.text.primary,
  transition: theme.transitions.create(
    ['background-color', 'color', 'box-shadow'],
    {
      duration: theme.transitions.duration.standard,
    },
  ),
}));

const ThemeToggleSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

const DashboardNavbar = ({ onOpenSidebar }: DashboardNavbarProps) => {
  const navigate = useNavigate();
  // Use the username selector for optimized renders
  const username = useAuthStore(selectUsername);
  const logout = useAuthStore(state => state.logout);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkMode, toggleTheme } = useThemeMode();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    // Use React Router navigation
    navigate('/login', { replace: true });
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar
        sx={{
          height: isMobile ? 64 : 'auto',
          minHeight: { xs: 64, sm: 'auto' },
          px: { xs: 1, sm: 2 },
        }}
      >
        <IconButton
          edge="start"
          aria-label="open drawer"
          onClick={onOpenSidebar}
          sx={{
            mr: isMobile ? 1 : 2,
            color:
              theme.palette.mode === 'dark'
                ? theme.palette.text.primary
                : theme.palette.grey[700],
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant={isMobile ? 'body1' : 'h6'}
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontSize: { xs: '0.9rem', sm: '1.25rem' },
            color: theme.palette.text.primary,
          }}
        >
          {isMobile ? 'SAP' : 'SAP - Sistema de Apoio à Produção'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: 2,
          }}
        >
          {isMobile ? (
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              size="small"
              sx={{
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.common.white
                    : theme.palette.grey[700],
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              {isDarkMode ? (
                <Brightness7Icon fontSize="small" />
              ) : (
                <Brightness4Icon fontSize="small" />
              )}
            </IconButton>
          ) : (
            <FormControlLabel
              control={
                <ThemeToggleSwitch
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
              }
              label=""
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isMobile && (
            <Box sx={{ mr: 2 }}>
              <AuthStatus />
            </Box>
          )}

          <Tooltip title={username || 'Usuário'}>
            <IconButton
              edge="end"
              onClick={handleMenuOpen}
              sx={{ ml: isMobile ? 0 : 1 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              {!isMobile && (
                <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
              )}
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: '100%', sm: 200 },
                maxWidth: '100%',
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                ...(isMobile && {
                  left: '0 !important',
                  right: '0 !important',
                }),
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: theme.palette.background.paper,
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  borderLeft: `1px solid ${theme.palette.divider}`,
                  borderTop: `1px solid ${theme.palette.divider}`,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" color="inherit" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default DashboardNavbar;
