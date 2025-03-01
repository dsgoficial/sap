// Path: features\activities\routes\Activity.tsx
import { Container, Typography, Box } from '@mui/material';
import { ActivityCard } from '../components/ActivityCard';

export const Activity = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Sistema de Apoio à Produção
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <ActivityCard />
      </Box>
    </Container>
  );
};