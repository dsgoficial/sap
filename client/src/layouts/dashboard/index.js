import { useState, useEffect, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';

const APP_BAR_MOBILE = 100;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
  }
}));


// ----------------------------------------------------------------------

export default function MarketplaceLayout() {

  const [open, setOpen] = useState(false);

  return (
    <RootStyle>
      <DashboardNavbar isOpenSidebar={open} onOpenSidebar={() => setOpen(true)} />
      <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} />
      <MainStyle open={open}>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
}
