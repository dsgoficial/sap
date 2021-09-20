import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'

import { history } from './services'
import { PrivateRoute } from './helpers'

import Login from './Login'
import NaoEncontrado from './NaoEncontrado'
import Erro from './Erro'
import Main from './Main'

const Routes = () => (
  <Router history={history}>
    <Switch>
      <PrivateRoute exact path='/' component={Main} />
      <Route exact path='/login' component={Login} />
      <Route exact path='/erro' component={Erro} />
      <Route path='*' component={NaoEncontrado} />
    </Switch>
  </Router>
)

export default Routes
