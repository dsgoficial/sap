// Path: App.tsx
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './lib/theme';
import queryClient from './lib/queryClient';
import Router from './routes';
import ErrorBoundary from './components/ui/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <CssBaseline />
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
