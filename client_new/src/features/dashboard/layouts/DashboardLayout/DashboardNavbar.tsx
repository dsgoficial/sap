// Path: features\dashboard\layouts\DashboardLayout\DashboardNavbar.tsx
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
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../../../hooks/useAuth';

interface DashboardNavbarProps {
  isOpenSidebar: boolean;
  onOpenSidebar: () => void;
  drawerWidth?: number;
}

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isOpenSidebar' && prop !== 'drawerWidth'
})<{ isOpenSidebar: boolean; drawerWidth: number }>(
  ({ theme, isOpenSidebar, drawerWidth }) => ({
    boxShadow: theme.shadows[3],
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: theme.palette.text.primary,
    [theme.breakpoints.up('lg')]: {
      width: isOpenSidebar ? `calc(100% - ${drawerWidth}px)` : '100%',
      marginLeft: isOpenSidebar ? `${drawerWidth}px` : 0,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    }
  })
);

const StyledMenuButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isOpenSidebar'
})<{ isOpenSidebar: boolean }>(
  ({ isOpenSidebar }) => ({
    display: { xs: 'inline-flex', lg: isOpenSidebar ? 'none' : 'inline-flex' },
    marginRight: 2
  })
);

const DashboardNavbar = ({ 
  isOpenSidebar, 
  onOpenSidebar, 
  drawerWidth = 280 
}: DashboardNavbarProps) => {
  const { logout, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  
  return (
    <StyledAppBar 
      position="fixed" 
      isOpenSidebar={isOpenSidebar}
      drawerWidth={drawerWidth}
    >
      <Toolbar>
        <StyledMenuButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={onOpenSidebar}
          isOpenSidebar={isOpenSidebar}
        >
          <MenuIcon />
        </StyledMenuButton>
        
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1 }}
        >
          SAP - Sistema de Apoio à Produção
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit"
            edge="end"
            onClick={handleMenuOpen}
            sx={{ mr: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
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