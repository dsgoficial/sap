// Path: features\fieldActivities\routes\FieldActivities.tsx
import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import CampoMap from '../components/CampoMap';
import FieldActivitySidebar from '../components/FieldActivitySidebar';
import { useFieldActivities } from '@/hooks/useFieldActivities';
import Page from '@/components/Page/Page';

export const FieldActivities: React.FC = () => {
  const { error } = useFieldActivities();

  return (
    <Page title="Atividades de Campo">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom component="div">
          Atividades de Campo
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Erro ao carregar dados: {error.message}
          </Alert>
        )}

        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <CampoMap />
        </Paper>

        {/* Sidebar component rendered outside Paper to allow proper drawer behavior */}
        <FieldActivitySidebar />
      </Box>
    </Page>
  );
};

export default FieldActivities;
