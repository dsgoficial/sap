// Path: features\dashboard\layouts\DashboardSidebar.tsx
import { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
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
import { useAuthStore } from '@/stores/authStore';

interface DashboardSidebarProps {
  isOpenSidebar: boolean;
  onCloseSidebar: () => void;
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
  isOpenSidebar,
  onCloseSidebar,
  drawerWidth = 280,
}: DashboardSidebarProps) => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && isOpenSidebar) {
      onCloseSidebar();
    }
  }, [pathname, isMobile, isOpenSidebar, onCloseSidebar]);

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
      title: 'Grade de Acompanhamento',
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
      title: 'Micro Controle',
      path: '/micro-control',
      icon: <SettingsIcon />,
      adminOnly: true,
    },
    {
      title: 'Mapas de Acompanhamento',
      path: '/maps',
      icon: <MapIcon />,
      adminOnly: true,
    },
  ];

  const filteredItems = menuItems.filter(
    item => !item.adminOnly || (item.adminOnly && isAdmin),
  );

  const drawer = (
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
          <Avatar
            src="/images/logo.png"
            alt="SAP Logo"
            sx={{ width: 40, height: 40, mr: 2 }}
          />

          {isOpenSidebar && (
            <Typography variant="h6" noWrap>
              Menu
            </Typography>
          )}
        </Box>

        <IconButton onClick={onCloseSidebar}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>

      <Divider />

      <List>
        {filteredItems.map(item => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={pathname === item.path}
            sx={{
              minHeight: 48,
              justifyContent: isOpenSidebar ? 'initial' : 'center',
              px: 2.5,
              // Increase touch target on mobile
              ...(isMobile && {
                py: 1.5,
              }),
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpenSidebar ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              sx={{
                opacity: isOpenSidebar ? 1 : 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
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
      {isMobile && (
        <Drawer
          variant="temporary"
          open={isOpenSidebar}
          onClose={onCloseSidebar}
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
          {drawer}
        </Drawer>
      )}

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open={isOpenSidebar}
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: isOpenSidebar
            ? drawerWidth
            : theme => `calc(${theme.spacing(7)} + 1px)`,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: isOpenSidebar
              ? drawerWidth
              : theme => `calc(${theme.spacing(7)} + 1px)`,
            transition: theme =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflowX: 'hidden',
          },
          transition: theme =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default DashboardSidebar;
