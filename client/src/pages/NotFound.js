import React from 'react'
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Typography, Container, Button } from '@mui/material';
import Page from '../components/Page';

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '80vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0)
}));

export default function Page404() {
  return (
    <Page title="Sistema de Apoio à Produção">
      <Container>
        <ContentStyle sx={{ textAlign: 'center', alignItems: 'center' }}>
          <div>
            <Typography variant='h1'>
              404
            </Typography>
          </div>
          <div>
            <Typography variant='h4' gutterBottom>
              Página não encontrada
            </Typography>
          </div>
          <div>
            <Button to="/" size="large" variant="contained" component={RouterLink}>
              Retorne a página principal
            </Button>
          </div>
        </ContentStyle>
      </Container>
    </Page>
  );
}