import React, { lazy, Suspense } from 'react';
import { Navigate, useRoutes, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute'
// ----------------------------------------------------------------------
const DashboardLayout = lazy(() => import('./layouts/dashboard'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))
// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        { path: '/', element: <PrivateRoute><Dashboard /></PrivateRoute> },
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
