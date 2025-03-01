// Path: components\ui\ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Stack 
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Você também pode registrar o erro em um serviço de relatório de erros
    this.setState({
      error,
      errorInfo,
    });

    // Chamar callback de erro se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log no console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Renderizar fallback personalizado, se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderizar UI de fallback padrão
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 2,
              border: '1px solid #f1f1f1'
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h4" gutterBottom color="error">
              Algo deu errado
            </Typography>
            
            <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 4 }}>
              Ocorreu um erro ao renderizar esta página. Por favor, tente recarregar a página ou voltar à página inicial.
            </Typography>
            
            {this.state.error && (
              <Box sx={{ 
                textAlign: 'left', 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1,
                mb: 4,
                overflowX: 'auto'
              }}>
                <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                  Detalhes do erro:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<RefreshIcon />} 
                onClick={this.handleReload}
              >
                Recarregar página
              </Button>
              
              <Button 
                component={RouterLink} 
                to="/" 
                variant="outlined" 
                startIcon={<HomeIcon />}
              >
                Página inicial
              </Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;