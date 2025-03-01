// Path: routes\index.tsx
import { Suspense, lazy } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { PrivateRoute } from '../components/ui/PrivateRoute';
import { UserRole } from '../types/auth';

// Layouts
const DashboardLayout = lazy(() => import('../components/layouts/DashboardLayout'));

// Pages
const Login = lazy(() => import('../features/auth/routes/Login').then(module => ({ default: module.Login })));
const Activity = lazy(() => import('../features/activities/routes/Activity').then(module => ({ default: module.Activity })));
const Dashboard = lazy(() => import('../features/dashboard/routes/Dashboard').then(module => ({ default: module.Dashboard })));
const Grids = lazy(() => import('../features/grid/routes/Grids').then(module => ({ default: module.Grids })));
const Subphases = lazy(() => import('../features/subphases/routes/Subphases').then(module => ({ default: module.Subphases })));
const SubphaseSituation = lazy(() => import('../features/subphases/routes/SubphaseSituation').then(module => ({ default: module.SubphaseSituation })));
const UserActivities = lazy(() => import('../features/subphases/routes/UserActivities').then(module => ({ default: module.UserActivities })));
const Lot = lazy(() => import('../features/lot/routes/Lot').then(module => ({ default: module.Lot })));
const PIT = lazy(() => import('../features/pit/routes/PIT').then(module => ({ default: module.PIT })));
const MicroControl = lazy(() => import('../features/microControl/routes/MicroControl').then(module => ({ default: module.MicroControl })));
const Maps = lazy(() => import('../features/maps/routes/Maps').then(module => ({ default: module.Maps })));
const NotFound = lazy(() => import('./NotFound').then(module => ({ default: module.NotFound })));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const Router = () => {
  return useRoutes([
    // Public routes
    {
      path: 'login',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      ),
    },
    
    // Protected routes
    {
      path: '/',
      element: (
        <PrivateRoute>
          <Suspense fallback={<LoadingFallback />}>
            <DashboardLayout />
          </Suspense>
        </PrivateRoute>
      ),
      children: [
        { path: '', element: <Navigate to="/activity" replace /> },
        { 
          path: 'dashboard', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            </PrivateRoute>
          )
        },
        { 
          path: 'activity', 
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Activity />
            </Suspense>
          )
        },
        { 
          path: 'grid', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <Grids />
              </Suspense>
            </PrivateRoute>
          )
        },
        { 
          path: 'subphases', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <Subphases />
              </Suspense>
            </PrivateRoute>
          )
        },
        { 
          path: 'user-activities', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <UserActivities />
              </Suspense>
            </PrivateRoute>
          )
        },
        { 
          path: 'lot', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <Lot />
              </Suspense>
            </PrivateRoute>
          )
        },
        { 
          path: 'subphases-situation', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <SubphaseSituation />
              </Suspense>
            </PrivateRoute>
          )
        },
        { 
          path: 'pit', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <PIT />
              </Suspense>
            </PrivateRoute>
          )
        },
        { 
          path: 'micro-control', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <MicroControl />
              </Suspense>
            </PrivateRoute>
          )
        },
        { 
          path: 'maps', 
          element: (
            <PrivateRoute requiredRole={UserRole.ADMIN}>
              <Suspense fallback={<LoadingFallback />}>
                <Maps />
              </Suspense>
            </PrivateRoute>
          )
        },
      ],
    },
    
    // 404
    {
      path: '404',
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <NotFound />
        </Suspense>
      ),
    },
    
    // Catch all
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
};

export default Router;