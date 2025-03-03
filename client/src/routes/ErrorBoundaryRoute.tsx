// Path: routes\ErrorBoundaryRoute.tsx
import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

export const ErrorBoundaryRoute = () => {
  const error = useRouteError();

  let errorMessage = 'Ocorreu um erro inesperado.';
  let statusCode = 500;
  let errorDetails = '';

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

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
          {statusCode === 404 ? 'Página não encontrada' : 'Erro no aplicativo'}
        </Typography>

        <Typography
          variant="body1"
          paragraph
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          {statusCode === 404
            ? 'A página que você está procurando não existe ou foi movida.'
            : errorMessage}
        </Typography>

        {errorDetails && (
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
              {errorDetails}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<HomeIcon />}
          >
            Página inicial
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
