// Path: components\layouts\AuthLayout.tsx
import { ReactNode } from 'react';
import { Box, Container, Typography } from '@mui/material';
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
  shouldForwardProp: prop => prop !== 'bgImageNumber',
})<{ bgImageNumber: number }>(({ bgImageNumber }) => ({
  // Fix image path by using the correct path format with the public folder
  backgroundImage: `url('/src/assets/images/img-${bgImageNumber}.jpg')`,
  // Fallback color in case the image doesn't load
  backgroundColor: '#f5f5f5',
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

export const AuthLayout = ({
  children,
  title,
  backgroundImageNumber = defaultImageNumber,
  maxWidth = 'sm',
}: AuthLayoutProps) => {
  return (
    <BackgroundBox bgImageNumber={backgroundImageNumber}>
      <Container maxWidth={maxWidth} sx={{ py: 4 }}>
        {title && (
          <Typography component="h1" variant="h5" gutterBottom>
            {title}
          </Typography>
        )}

        {children}
      </Container>
    </BackgroundBox>
  );
};
