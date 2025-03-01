// Path: components\layouts\AuthLayout.tsx
import { ReactNode } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  backgroundImageNumber?: number;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Generate a random number between 1 and 5 for background image if not provided
const defaultImageNumber = Math.floor(Math.random() * 5) + 1;

const BackgroundBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'bgImageNumber'
})<{ bgImageNumber: number }>(({ bgImageNumber }) => ({
  backgroundImage: `url('/images/img-${bgImageNumber}.jpg')`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  height: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '100%',
  backdropFilter: 'blur(5px)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
}));

export const AuthLayout = ({ 
  children, 
  title,
  backgroundImageNumber = defaultImageNumber,
  maxWidth = 'sm'
}: AuthLayoutProps) => {
  return (
    <BackgroundBox bgImageNumber={backgroundImageNumber}>
      <Container maxWidth={maxWidth} sx={{ py: 8 }}>
        <ContentPaper elevation={3}>
          {title && (
            <Typography component="h1" variant="h5" gutterBottom>
              {title}
            </Typography>
          )}
          
          {children}
        </ContentPaper>
      </Container>
    </BackgroundBox>
  );
};