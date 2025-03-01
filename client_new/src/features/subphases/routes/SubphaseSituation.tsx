// Path: features\subphases\routes\SubphaseSituation.tsx
import { useState } from 'react';
import { Container, Box, Typography, Alert, CircularProgress } from '@mui/material';
import Page from '../../../components/Page';
import { useSubphaseSituation } from '../hooks/useSubphases';
import StackedBarChart from '../components/StackedBarChart';
import { useAuthStore } from '../../../stores/authStore';
import { Navigate } from 'react-router-dom';

export const SubphaseSituation = () => {
  const { isAdmin } = useAuthStore();
  const { data, isLoading, error } = useSubphaseSituation();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <Page title="Situação Subfase">
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Situação Subfase">
        <Container>
          <Alert severity="error" sx={{ mt: 2 }}>
            Erro ao carregar dados de situação de subfases. Por favor, tente novamente.
          </Alert>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Situação Subfase">
      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Situação Subfase
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {data && data.map((item, idx) => (
            <StackedBarChart key={idx} data={item} />
          ))}

          {data && data.length === 0 && (
            <Alert severity="info">
              Nenhuma situação de subfase disponível.
            </Alert>
          )}
        </Box>
      </Container>
    </Page>
  );
};

export default SubphaseSituation;