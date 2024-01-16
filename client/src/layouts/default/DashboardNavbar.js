import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAPI } from '../../contexts/apiContext'
import { styled } from '@mui/system';

const drawerWidth = 280

const AppBarStyled = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== "isOpenSidebar"
})(({ theme, isOpenSidebar }) => {
    return (isOpenSidebar) ?
        ({
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
            })
        }) :
        ({
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen
            })
        })
});

const IconMenuStyled = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== "isOpenSidebar"
})(({ theme, isOpenSidebar }) => {
    return (isOpenSidebar) ?
        ({
            display: 'none'
        }) :
        ({
            marginRight: 15
        })
});

export default function DashboardNavbar({ isOpenSidebar, onOpenSidebar }) {

    const {
        logout,
        history
    } = useAPI()

    const clickLogout = () => {
        logout();
        history.go('/login')
    };

    return (
        <div
            sx={{
                display: 'flex'
            }}
        >
            <AppBarStyled
                position="fixed"
                isOpenSidebar={isOpenSidebar}
            >
                <Toolbar
                    sx={{
                        paddingRight: 21
                    }}
                >
                    <IconMenuStyled
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={onOpenSidebar}
                        isOpenSidebar={isOpenSidebar}
                    >
                        <MenuIcon />
                    </IconMenuStyled>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{
                            flexGrow: 1
                        }}
                    >
                        SAP
                    </Typography>
                    <IconButton color="inherit" onClick={clickLogout}>
                        <Typography
                            variant="body1"
                            color="inherit"
                            noWrap
                            sx={{
                                flexGrow: 1
                            }}
                        >
                            Sair
                        </Typography>
                        <ExitToAppIcon
                            sx={{
                                marginLeft: 1
                            }}
                        />
                    </IconButton>
                </Toolbar>
            </AppBarStyled>
        </div>
    );
}