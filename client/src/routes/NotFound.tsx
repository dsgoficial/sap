// Path: routes\NotFound.tsx
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ContentBox = styled(Box)(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '80vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

export const NotFound = () => {
  return (
    <Container>
      <ContentBox sx={{ textAlign: 'center', alignItems: 'center' }}>
        <Typography variant="h1" paragraph>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Página não encontrada
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5 }}>
          A página que você está procurando não existe ou foi movida.
        </Typography>

        <Button to="/" size="large" variant="contained" component={RouterLink}>
          Retorne à página principal
        </Button>
      </ContentBox>
    </Container>
  );
};
