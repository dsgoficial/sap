// Path: App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import queryClient from './lib/queryClient';
import router from './routes'; // Import the router configuration
import ErrorBoundary from './components/ui/ErrorBoundary';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <CssBaseline />
            <RouterProvider router={router} />
          </SnackbarProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
