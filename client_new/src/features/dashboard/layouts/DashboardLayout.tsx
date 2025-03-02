// Path: features\dashboard\layouts\DashboardLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';

// Constants
const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;
const DRAWER_WIDTH = 280;

// Styled components
const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const MainStyle = styled('div', {
  shouldForwardProp: prop => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
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
    transition: theme.transitions.create('margin', {
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [open, setOpen] = useState(!isMobile);

  // Close sidebar automatically on mobile
  const handleDrawerToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  return (
    <RootStyle>
      <DashboardNavbar
        isOpenSidebar={open}
        onOpenSidebar={handleDrawerToggle}
      />
      <DashboardSidebar
        isOpenSidebar={open}
        onCloseSidebar={handleDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
      />
      <MainStyle open={open}>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
};

export default DashboardLayout;
