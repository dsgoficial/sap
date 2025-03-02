// Path: features\dashboard\layouts\DashboardNavbar.tsx
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuthStore } from '@/stores/authStore';
import { AuthStatus } from '@/features/auth/components/AuthStatus';

interface DashboardNavbarProps {
  isOpenSidebar: boolean;
  onOpenSidebar: () => void;
  drawerWidth?: number;
}

interface StyledAppBarProps {
  isopensidebar: number;
  drawerwidth: number;
}

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: prop => prop !== 'isopensidebar' && prop !== 'drawerwidth',
})<StyledAppBarProps>(({ theme, isopensidebar, drawerwidth }) => ({
  boxShadow: theme.shadows[3],
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: theme.palette.text.primary,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  [theme.breakpoints.up('lg')]: {
    width: isopensidebar ? `calc(100% - ${drawerwidth}px)` : '100%',
    marginLeft: isopensidebar ? `${drawerwidth}px` : 0,
  },
}));

interface StyledMenuButtonProps {
  isopensidebar: number;
}

const StyledMenuButton = styled(IconButton, {
  shouldForwardProp: prop => prop !== 'isopensidebar',
})<StyledMenuButtonProps>(({ isopensidebar, theme }) => ({
  marginRight: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    display: isopensidebar ? 'none' : 'inline-flex',
  },
}));

const DashboardNavbar = ({
  isOpenSidebar,
  onOpenSidebar,
  drawerWidth = 280,
}: DashboardNavbarProps) => {
  const navigate = useNavigate();
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
    navigate('/login');
  };

  return (
    <StyledAppBar
      position="fixed"
      isopensidebar={isOpenSidebar ? 1 : 0}
      drawerwidth={drawerWidth}
    >
      <Toolbar
        sx={{
          height: isMobile ? 64 : 'auto',
          minHeight: { xs: 64, sm: 'auto' },
          px: { xs: 1, sm: 2 },
        }}
      >
        <StyledMenuButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onOpenSidebar}
          isopensidebar={isOpenSidebar ? 1 : 0}
          sx={{ mr: isMobile ? 1 : 2 }}
        >
          <MenuIcon />
        </StyledMenuButton>

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
          {/* Use AuthStatus here */}
          {!isMobile && (
            <Box sx={{ mr: 2 }}>
              <AuthStatus showAvatar={false} />
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
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              Perfil
            </MenuItem>
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
