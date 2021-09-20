import React from 'react'
import { NavLink } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import InsertChartIcon from '@material-ui/icons/InsertChart'
import ListIcon from '@material-ui/icons/List'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import EditIcon from '@material-ui/icons/Edit'
import DataUsageIcon from '@material-ui/icons/DataUsage'
import Tooltip from '@material-ui/core/Tooltip'
import AddAlarmIcon from '@material-ui/icons/AddAlarm'
import AlarmOnIcon from '@material-ui/icons/AlarmOn'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'

import styles from './styles'

export const MainListItems = props => {
  const classes = styles()

  return (
    <List>
      <Divider />
      <Tooltip title='Atividades' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/' activeClassName={classes.active}>
          <ListItemIcon>
            <InsertChartIcon />
          </ListItemIcon>
          <ListItemText primary='Atividades' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Informações do usuário' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/informacoes_usuario' activeClassName={classes.active}>
          <ListItemIcon>
            <LibraryAddIcon />
          </ListItemIcon>
          <ListItemText primary='Informações do usuário' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Cadastar outras atividades' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/cadastrar_atividades' activeClassName={classes.active}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary='Cadastar outras atividades' />
        </ListItem>
      </Tooltip>

    </List>
  )
}

export const AdminListItems = props => {
  const classes = styles()

  return (
    <List>
      <Divider />
      <ListSubheader inset>Administração</ListSubheader>

      <Tooltip title='Gerenciar RH' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/gerenciar_rh' activeClassName={classes.active}>
          <ListItemIcon>
            <VerifiedUserIcon />
          </ListItemIcon>
          <ListItemText primary='Gerenciar RH' />
        </ListItem>
      </Tooltip>

      <Tooltip title='Informações dos usuários' placement='right-start'>
        <ListItem button component={NavLink} replace exact to='/informacoes_usuarios_adm' activeClassName={classes.active}>
          <ListItemIcon>
            <VerifiedUserIcon />
          </ListItemIcon>
          <ListItemText primary='Informações dos usuários' />
        </ListItem>
      </Tooltip>

    </List>
  )
}
