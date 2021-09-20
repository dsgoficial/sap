import React, { useState } from "react";
import { withRouter, HashRouter } from "react-router-dom";
import clsx from "clsx";
import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import Container from "@material-ui/core/Container";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

import styles from "./styles";
import { MainListItems, AdminListItems } from "./list_items";
import { handleLogout } from "./api.js";

import { PrivateRoute } from "../helpers";

import Dashboard from "../Dashboard";
import AdicionarRotina from "../AdicionarRotina";
import AtualizarRotina from "../AtualizarRotina";
import Categorias from "../Categorias";
import Rotinas from "../Rotinas";
import LogsTable from "../LogsTable";
import GerenciarUsuarios from "../GerenciarUsuarios";
import ArquivosTemporarios from "../ArquivosTemporarios";
import Tarefas from "../Tarefas";
import ExecucaoAgendada from "../ExecucaoAgendada";
import ExecutarRotina from "../ExecutarRotina";

const Main = withRouter((props) => {
  const classes = styles();

  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const clickLogout = () => {
    handleLogout();
    props.history.push("/login");
  };

  return (
    <div className={classes.root}>
      <HashRouter>
        <AppBar
          position="absolute"
          className={clsx(classes.appBar, open && classes.appBarShift)}
        >
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              className={clsx(
                classes.menuButton,
                open && classes.menuButtonHidden
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              Sistema de Apoio à Produção
            </Typography>
            <IconButton color="inherit" onClick={clickLogout}>
              <Typography
                variant="body1"
                color="inherit"
                noWrap
                className={classes.title}
              >
                Sair
              </Typography>
              <ExitToAppIcon className={classes.logoutButton} />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            <Typography variant="h6" className={classes.menu}>
              Menu
            </Typography>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <MainListItems />
          {props.role === "ADMIN" && (
            <>
              <AdminListItems />
            </>
          )}
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="xl" className={classes.container}>
            <PrivateRoute exact path="/" component={Dashboard} />
            <PrivateRoute
              exact
              path="/adicionar_rotina"
              component={AdicionarRotina}
            />
            <PrivateRoute
              exact
              path="/atualizar_rotina"
              component={AtualizarRotina}
            />
            <PrivateRoute exact path="/categorias" component={Categorias} />
            <PrivateRoute exact path="/rotinas" component={Rotinas} />
            <PrivateRoute exact path="/agendar_tarefas" component={Tarefas} />
            <PrivateRoute exact path="/executar" component={ExecutarRotina} />
            <PrivateRoute
              exact
              path="/execucoes_agendadas"
              component={ExecucaoAgendada}
            />
            <PrivateRoute exact path="/logs" component={LogsTable} />
            <PrivateRoute
              role="ADMIN"
              exact
              path="/gerenciar_usuarios"
              component={GerenciarUsuarios}
            />
            <PrivateRoute
              role="ADMIN"
              exact
              path="/arquivos_temporarios"
              component={ArquivosTemporarios}
            />
          </Container>
        </main>
      </HashRouter>
    </div>
  );
});

export default Main