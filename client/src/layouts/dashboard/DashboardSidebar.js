import { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';
import {
    Typography,
    List,
    Divider,
    IconButton,
    ListItemText,
    ListItemButton
} from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import GridOnIcon from '@mui/icons-material/GridOn';
import { styled, useTheme } from '@mui/material/styles';
import { useAPI } from '../../contexts/apiContext'

const drawerWidth = 280

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));


const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export default function MarketplaceSidebar({ isOpenSidebar, onCloseSidebar }) {
    const theme = useTheme();

    const { pathname } = useLocation();

    const {
        getAuthorization
    } = useAPI()

    useEffect(() => {
        if (isOpenSidebar) {
            onCloseSidebar();
        }
    }, [pathname]);// eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Drawer variant="permanent" open={isOpenSidebar}>
            <DrawerHeader>
                <Typography
                    sx={{
                        flexGrow: 1,
                        textAlign: 'center'
                    }}
                    variant="h6"
                >
                    Menu
                </Typography>
                <IconButton onClick={onCloseSidebar}>
                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: isOpenSidebar ? 'initial' : 'center',
                        px: 2.5,
                    }}
                    to="/"
                    component={RouterLink}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: isOpenSidebar ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                    >
                        <AutoGraphIcon />
                    </ListItemIcon>
                    <ListItemText primary={'SAP'} sx={{ opacity: isOpenSidebar ? 1 : 0 }} />
                </ListItemButton>
                <ListItemButton
                    style={getAuthorization() == 'ADMIN' ? {} : { display: 'none' }}
                    sx={{
                        minHeight: 48,
                        justifyContent: isOpenSidebar ? 'initial' : 'center',
                        px: 2.5,
                    }}
                    to="/grid"
                    component={RouterLink}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: isOpenSidebar ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                    >
                        <GridOnIcon />
                    </ListItemIcon>
                    <ListItemText primary={'Grade de Acompanhamento'} sx={{ opacity: isOpenSidebar ? 1 : 0 }} />
                </ListItemButton>

            </List>
            <Divider />
        </Drawer>
    );
}