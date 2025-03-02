// Path: features\dashboard\layouts\DashboardLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material';
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
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginLeft: open ? DRAWER_WIDTH : 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <RootStyle>
      <DashboardNavbar
        isOpenSidebar={open}
        onOpenSidebar={() => setOpen(true)}
      />
      <DashboardSidebar
        isOpenSidebar={open}
        onCloseSidebar={() => setOpen(false)}
        drawerWidth={DRAWER_WIDTH}
      />
      <MainStyle open={open}>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
};

export default DashboardLayout;
