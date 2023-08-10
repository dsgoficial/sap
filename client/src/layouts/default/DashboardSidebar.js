import { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';
import {
    Typography,
    List,
    Divider,
    IconButton,
    ListItemText,
    ListItemButton,
    Box
} from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import GridOnIcon from '@mui/icons-material/GridOn';
import { styled, useTheme } from '@mui/material/styles';
import { useAPI } from '../../contexts/apiContext'
import DashboardIcon from '@mui/icons-material/Dashboard';

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
                {
                    [
                        {
                            label: 'Dashboard',
                            path: '/dashboard',
                            icon: <DashboardIcon sx={{ color: 'black' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        },
                        {
                            label: 'PIT',
                            path: '/pit',
                            icon: <Box component={'img'} src={`${process.env.PUBLIC_URL}/table2.png`} sx={{ width: '25px' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        },
                        {
                            label: 'SAP',
                            path: '/activity',
                            icon:  <AutoGraphIcon sx={{ color: 'black' }} />,
                            style: {}
                        },
                        {
                            label: 'Grade de Acompanhamento',
                            path: '/grid',
                            icon: <GridOnIcon sx={{ color: 'black' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        },
                        {
                            label: 'Atividade por Subfase',
                            path: '/subphases',
                            icon: <Box component={'img'} src={`${process.env.PUBLIC_URL}/bar.png`} sx={{ width: '25px' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        },
                        {
                            label: 'Atividades por Usuário',
                            path: '/user-activities',
                            icon: <Box component={'img'} src={`${process.env.PUBLIC_URL}/users.png`} sx={{ width: '25px' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        },
                        {
                            label: 'Acompanhamento Lote',
                            path: '/lot',
                            icon: <Box component={'img'} src={`${process.env.PUBLIC_URL}/table.png`} sx={{ width: '25px' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        },
                        {
                            label: 'Situação Subfase',
                            path: '/subphases-situation',
                            icon: <Box component={'img'} src={`${process.env.PUBLIC_URL}/situation.png`} sx={{ width: '25px' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        },
                        {
                            label: 'Micro Controle',
                            path: '/micro-control',
                            icon: <Box component={'img'} src={`${process.env.PUBLIC_URL}/adm.png`} sx={{ width: '25px' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        },
                        {
                            label: 'Mapas de Acompanhamento',
                            path: '/maps',
                            icon: <Box component={'img'} src={`${process.env.PUBLIC_URL}/map.png`} sx={{ width: '25px' }} />,
                            style: getAuthorization() == 'ADMIN' ? {} : { display: 'none' }
                        }
                    ].map((item, idx) => {
                        return (
                            <ListItemButton
                                key={idx}
                                style={item.style}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: isOpenSidebar ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                                to={item.path}
                                component={RouterLink}
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
                                <ListItemText primary={item.label} sx={{ opacity: isOpenSidebar ? 1 : 0 }} />
                            </ListItemButton>
                        )
                    })
                }
            </List>
            <Divider />
        </Drawer>
    );
}