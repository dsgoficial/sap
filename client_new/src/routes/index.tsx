// Path: routes\index.tsx
import { Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  Navigate,
  redirect,
  RouteObject,
  ScrollRestoration,
} from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { UserRole } from '../types/auth';
import { isTokenExpired } from '../stores/authStore';
import { ErrorBoundaryRoute } from './ErrorBoundaryRoute';

// Layouts
const DashboardLayout = lazy(() => import('@/components/layouts/AppLayout'));

// Pages with lazy loading
const Login = lazy(() => import('../features/auth/routes/Login'));
const Activity = lazy(() =>
  import('../features/activities/routes/Activity').then(module => ({
    default: module.Activity,
  })),
);
const Dashboard = lazy(() =>
  import('../features/dashboard/routes/Dashboard').then(module => ({
    default: module.Dashboard,
  })),
);
const Grids = lazy(() =>
  import('../features/grid/routes/Grids').then(module => ({
    default: module.Grids,
  })),
);
const Subphases = lazy(() =>
  import('../features/subphases/routes/Subphases').then(module => ({
    default: module.Subphases,
  })),
);
const UserActivities = lazy(() =>
  import('../features/subphases/routes/UserActivities').then(module => ({
    default: module.UserActivities,
  })),
);
const Lot = lazy(() =>
  import('../features/lot/routes/Lot').then(module => ({
    default: module.Lot,
  })),
);
const SubphaseSituation = lazy(() =>
  import('../features/subphases/routes/SubphaseSituation').then(module => ({
    default: module.SubphaseSituation,
  })),
);
const PIT = lazy(() =>
  import('../features/pit/routes/PIT').then(module => ({
    default: module.PIT,
  })),
);
const MicroControl = lazy(() =>
  import('../features/microControl/routes/MicroControl').then(module => ({
    default: module.MicroControl,
  })),
);
const Maps = lazy(() =>
  import('../features/map/routes/Maps').then(module => ({
    default: module.Maps,
  })),
);
const Unauthorized = lazy(() =>
  import('./Unauthorized').then(module => ({
    default: module.Unauthorized,
  })),
);
const NotFound = lazy(() =>
  import('./NotFound').then(module => ({
    default: module.NotFound,
  })),
);

// Import Dashboard loader
import { dashboardLoader } from '../features/dashboard/routes/Dashboard';

const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

// Auth loaders for protected routes
const authLoader = () => {
  const token = localStorage.getItem('@sap_web-Token');
  const isAuthenticated = !!token && !isTokenExpired();

  if (!isAuthenticated) {
    // Redirect to login and remember the intended destination
    const currentPath = window.location.pathname;
    return redirect(`/login?from=${encodeURIComponent(currentPath)}`);
  }

  return null; // Continue to the route if authenticated
};

// Admin role checker
const adminLoader = () => {
  const role = localStorage.getItem('@sap_web-User-Authorization');

  if (role !== UserRole.ADMIN) {
    return redirect('/unauthorized');
  }

  return null; // Continue if admin
};

// Helper for layout with scroll restoration
const AppLayoutWithScrollRestoration = () => (
  <>
    <DashboardLayout />
    <ScrollRestoration />
  </>
);

// Define routes using the new object format
const routes: RouteObject[] = [
  // Public routes
  {
    path: 'login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
    errorElement: <ErrorBoundaryRoute />,
  },

  // Protected routes
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AppLayoutWithScrollRestoration />
      </Suspense>
    ),
    loader: authLoader, // Apply auth check to the entire section
    errorElement: <ErrorBoundaryRoute />,
    children: [
      {
        path: '',
        element: <Navigate to="/activity" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
        loader: async () => {
          // Chain loaders - first check admin, then load data
          const adminResult = adminLoader();
          // If admin loader returned a redirect, return it
          if (adminResult) return adminResult;
          return dashboardLoader();
        },
        errorElement: <ErrorBoundaryRoute />, // Route-specific error element
      },
      {
        path: 'activity',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Activity />
          </Suspense>
        ),
      },
      // Admin routes
      {
        path: 'grid',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Grids />
          </Suspense>
        ),
        loader: adminLoader,
      },
      {
        path: 'subphases',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Subphases />
          </Suspense>
        ),
        loader: adminLoader,
      },
      {
        path: 'user-activities',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <UserActivities />
          </Suspense>
        ),
        loader: adminLoader,
      },
      {
        path: 'lot',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Lot />
          </Suspense>
        ),
        loader: adminLoader,
      },
      {
        path: 'subphases-situation',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SubphaseSituation />
          </Suspense>
        ),
        loader: adminLoader,
      },
      {
        path: 'pit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PIT />
          </Suspense>
        ),
        loader: adminLoader,
      },
      {
        path: 'microcontrol',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MicroControl />
          </Suspense>
        ),
        loader: adminLoader,
      },
      {
        path: 'maps',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Maps />
          </Suspense>
        ),
        loader: adminLoader,
      },
    ],
  },

  // Error routes
  {
    path: 'unauthorized',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Unauthorized />
      </Suspense>
    ),
    errorElement: <ErrorBoundaryRoute />,
  },
  {
    path: '404',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
    errorElement: <ErrorBoundaryRoute />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
];

// Create the router with the routes configuration
const router = createBrowserRouter(routes);

export default router;
