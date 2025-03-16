// Path: components\ui\ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showHomeButton?: boolean;
  showReloadButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static defaultProps = {
    showHomeButton: true,
    showReloadButton: true,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Call callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default fallback UI
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid #f1f1f1',
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />

            <Typography variant="h4" gutterBottom color="error">
              Algo deu errado
            </Typography>

            <Typography
              variant="body1"
              paragraph
              color="text.secondary"
              sx={{ mb: 4 }}
            >
              Ocorreu um erro ao renderizar esta página. Por favor, tente
              recarregar a página ou voltar à página inicial.
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  textAlign: 'left',
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  mb: 4,
                  overflowX: 'auto',
                }}
              >
                <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                  Detalhes do erro:
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ fontSize: '0.75rem' }}
                >
                  {this.state.error.toString()}
                </Typography>

                {this.state.errorInfo && (
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ fontSize: '0.75rem', mt: 1 }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}

            <Stack direction="row" spacing={2} justifyContent="center">
              {this.props.showReloadButton && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReload}
                >
                  Recarregar página
                </Button>
              )}

              {this.props.showHomeButton && (
                <Button
                  component={RouterLink}
                  to="/"
                  variant="outlined"
                  startIcon={<HomeIcon />}
                >
                  Página inicial
                </Button>
              )}
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
