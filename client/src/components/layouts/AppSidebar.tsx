// Path: components\layouts\AppSidebar.tsx
import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GridOnIcon from '@mui/icons-material/GridOn';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { useIsAdmin } from '@/stores/authStore';
import { useThemeMode } from '@/contexts/ThemeContext';

interface DashboardSidebarProps {
  mobileOpen: boolean;
  desktopOpen: boolean;
  onMobileClose: () => void;
  onDesktopClose: () => void;
  drawerWidth?: number;
}

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const DashboardSidebar = ({
  mobileOpen,
  desktopOpen,
  onMobileClose,
  onDesktopClose,
  drawerWidth = 280,
}: DashboardSidebarProps) => {
  const { pathname } = useLocation();
  const isAdmin = useIsAdmin();
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();

  // Use ref for close button to avoid focus issues
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Define menu items
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      adminOnly: true,
    },
    {
      title: 'SAP',
      path: '/activity',
      icon: <AutoGraphIcon />,
      adminOnly: false,
    },
    {
      title: 'Grade',
      path: '/grid',
      icon: <GridOnIcon />,
      adminOnly: true,
    },
    {
      title: 'Atividade por Subfase',
      path: '/subphases',
      icon: <BarChartIcon />,
      adminOnly: true,
    },
    {
      title: 'Atividades por Usuário',
      path: '/user-activities',
      icon: <PeopleIcon />,
      adminOnly: true,
    },
    {
      title: 'Acompanhamento Lote',
      path: '/lot',
      icon: <TableChartIcon />,
      adminOnly: true,
    },
    {
      title: 'Situação Subfase',
      path: '/subphases-situation',
      icon: <PieChartIcon />,
      adminOnly: true,
    },
    {
      title: 'PIT',
      path: '/pit',
      icon: <TableChartIcon />,
      adminOnly: true,
    },
    {
      title: 'Microcontrole',
      path: '/microcontrol',
      icon: <SettingsIcon />,
      adminOnly: true,
    },
    {
      title: 'Mapas',
      path: '/maps',
      icon: <MapIcon />,
      adminOnly: true,
    },
  ];

  const filteredItems = menuItems.filter(
    item => !item.adminOnly || (item.adminOnly && isAdmin),
  );

  // Handler for closing with blur to prevent focus issues
  const handleClose = (isMobileDrawer: boolean) => {
    // First blur any active elements to prevent focus retention
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Then close the drawer after a slight delay
    setTimeout(() => {
      if (isMobileDrawer) {
        onMobileClose();
      } else {
        onDesktopClose();
      }
    }, 10);
  };

  const drawer = (isMobileDrawer: boolean) => (
    <>
      <DrawerHeader>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            px: 2,
          }}
        >
          <Typography variant="h6" noWrap>
            Menu
          </Typography>
        </Box>

        <IconButton
          onClick={() => handleClose(isMobileDrawer)}
          ref={isMobileDrawer ? undefined : closeButtonRef}
          tabIndex={0}
        >
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>

      <Divider />

      <List>
        {filteredItems.map(item => (
          <ListItemButton
            key={item.path}
            component={Link} // Changed from RouterLink to Link
            to={item.path}
            selected={pathname === item.path}
            onClick={() => {
              if (isMobileDrawer) {
                handleClose(true);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: 'initial',
              px: 2.5,
              py: isMobileDrawer ? 1.5 : 1,
              '&.Mui-selected': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(144, 202, 249, 0.16)'
                    : 'rgba(33, 101, 209, 0.08)',
                // Add selected color for dark mode
                ...(theme.palette.mode === 'dark' && {
                  color: 'primary.light',
                }),
              },
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(144, 202, 249, 0.08)'
                    : 'rgba(33, 101, 209, 0.04)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                justifyContent: 'center',
                color:
                  pathname === item.path
                    ? isDarkMode
                      ? 'primary.light'
                      : 'primary.main'
                    : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                '& .MuiTypography-root': {
                  color:
                    pathname === item.path
                      ? isDarkMode
                        ? 'primary.light'
                        : 'primary.main'
                      : 'inherit',
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => handleClose(true)}
        disableEnforceFocus
        keepMounted
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer(true)}
      </Drawer>

      {/* Desktop drawer - now using PERMANENT variant which doesn't use aria-hidden */}
      <Drawer
        variant="permanent"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: desktopOpen ? drawerWidth : theme.spacing(7),
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            overflowX: 'hidden',
            border: 'none',
            ...(desktopOpen && {
              width: drawerWidth,
            }),
            ...(!desktopOpen && {
              width: theme.spacing(7),
              [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
              },
            }),
          },
          zIndex: 0,
        }}
      >
        {drawer(false)}
      </Drawer>
    </>
  );
};

export default DashboardSidebar;
