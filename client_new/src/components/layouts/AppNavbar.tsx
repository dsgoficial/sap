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
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuthStore } from '@/stores/authStore';
import { AuthStatus } from '@/features/auth/components/AuthStatus';

interface DashboardNavbarProps {
  onOpenSidebar: () => void;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: theme.shadows[3],
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: theme.palette.text.primary,
}));

const DashboardNavbar = ({ onOpenSidebar }: DashboardNavbarProps) => {
  const navigate = useNavigate(); // React Router v7 navigation hook
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    // Use navigate function for programmatic navigation in React Router v7
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
          color="inherit"
          aria-label="open drawer"
          onClick={onOpenSidebar}
          sx={{ mr: isMobile ? 1 : 2 }}
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
          }}
        >
          {isMobile ? 'SAP' : 'SAP - Sistema de Apoio à Produção'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isMobile && (
            <Box sx={{ mr: 2 }}>
              <AuthStatus />
            </Box>
          )}

          <Tooltip title={user?.username || 'Usuário'}>
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleMenuOpen}
              sx={{ ml: isMobile ? 0 : 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
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
              elevation: 0,
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
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
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
