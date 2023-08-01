import React, { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute'
import { useAPI } from './contexts/apiContext'

// ----------------------------------------------------------------------
const DefaultLayout = lazy(() => import('./layouts/default'))
const Activity = lazy(() => import('./pages/Activity'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Grids = lazy(() => import('./pages/Grids'))
const Subphases = lazy(() => import('./pages/Subphases'))
const UserActivities = lazy(() => import('./pages/UserActivities'))
const Lot = lazy(() => import('./pages/Lot'))
const SubphaseSituation = lazy(() => import('./pages/SubphaseSituation'))
const PIT = lazy(() => import('./pages/PIT'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MicroControl = lazy(() => import('./pages/MicroControl'))
// ----------------------------------------------------------------------

export default function Router() {

  const {
    getAuthorization
  } = useAPI()

  let defaultPage = getAuthorization() == 'ADMIN'? <PrivateRoute><Dashboard /></PrivateRoute>: <PrivateRoute><Activity /></PrivateRoute>


  return useRoutes([
    {
      path: '/',
      element: <DefaultLayout />,
      children: [
        { path: '/', element: defaultPage },
        { path: '/grid', element: <PrivateRoute><Grids /></PrivateRoute> },
        { path: '/subphases', element: <PrivateRoute><Subphases /></PrivateRoute> },
        { path: '/user-activities', element: <PrivateRoute><UserActivities /></PrivateRoute> },
        { path: '/lot', element: <PrivateRoute><Lot /></PrivateRoute> },
        { path: '/subphases-situation', element: <PrivateRoute><SubphaseSituation /></PrivateRoute> },
        { path: '/pit', element: <PrivateRoute><PIT /></PrivateRoute> },
        { path: '/dashboard', element: <PrivateRoute><Dashboard /></PrivateRoute> },
        { path: '/activity', element: <PrivateRoute><Activity /></PrivateRoute> },
        { path: '/micro-control', element: <PrivateRoute><MicroControl /></PrivateRoute> }
      ]
    },
    {
      path: '/login',
      children: [{
        path: '/login',
        element: <Login />
      }]
    },
    {
      path: '/404',
      children: [{
        path: '/404',
        element: <NotFound />
      }]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
