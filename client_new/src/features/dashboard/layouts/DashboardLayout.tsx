// Path: features\dashboard\layouts\DashboardLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';

// Constants
const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;
const DRAWER_WIDTH = 280;

// Styled components
const RootStyle = styled(Box)(({ theme: _theme }) => ({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
}));

const MainStyle = styled(Box)<{ open?: boolean }>(({ theme, open }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    marginLeft: open ? DRAWER_WIDTH : 0,
    width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: APP_BAR_MOBILE + 16,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(6),
  },
}));

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Toggle for mobile drawer
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Toggle for desktop drawer
  const handleDesktopDrawerToggle = () => {
    setDesktopOpen(!desktopOpen);
  };

  return (
    <RootStyle>
      <DashboardNavbar
        onOpenSidebar={isMobile ? handleMobileDrawerToggle : handleDesktopDrawerToggle}
      />
      
      <DashboardSidebar
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        onMobileClose={handleMobileDrawerToggle}
        onDesktopClose={handleDesktopDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
      />
      
      <MainStyle open={desktopOpen}>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
};

export default DashboardLayout;