// Path: components\layouts\AuthLayout.tsx
import { ReactNode } from 'react';
import { Box, Container, Typography, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useThemeMode } from '@/contexts/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  backgroundImageNumber?: number;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Generate a random number between 1 and 5 for background image if not provided
const defaultImageNumber = Math.floor(Math.random() * 5) + 1;

const BackgroundBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  position: 'relative',
  // Set background color as fallback
  backgroundColor:
    theme.palette.mode === 'dark'
      ? theme.palette.background.default
      : '#f5f5f5',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Add appropriate overlay for each theme
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.common.black, 0.7) // Darker overlay for dark mode
        : alpha(theme.palette.common.white, 0.1), // Lighter overlay for light mode
    zIndex: 1,
  },
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const AuthLayout = ({
  children,
  title,
  backgroundImageNumber = defaultImageNumber,
  maxWidth = 'sm',
}: AuthLayoutProps) => {
  const { isDarkMode } = useThemeMode();

  return (
    <BackgroundBox
      sx={{
        backgroundImage: `url('/src/assets/images/img-${backgroundImageNumber}.jpg')`,
      }}
    >
      <ContentContainer maxWidth={maxWidth}>
        {title && (
          <Typography
            component="h1"
            variant="h5"
            gutterBottom
            color={isDarkMode ? 'common.white' : 'text.primary'}
            align="center"
            sx={{ mb: 4, fontWeight: 'medium' }}
          >
            {title}
          </Typography>
        )}

        {children}
      </ContentContainer>
    </BackgroundBox>
  );
};
