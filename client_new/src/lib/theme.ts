// Path: lib\theme.ts
import { createTheme } from '@mui/material/styles';

// Light theme - based on existing theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2065D1',
      light: '#76B0F1',
      dark: '#103996',
    },
    secondary: {
      main: '#F50057',
      light: '#FF4081',
      dark: '#C51162',
    },
    error: {
      main: '#FF4842',
      light: '#FFA48D',
      dark: '#B72136',
    },
    warning: {
      main: '#FFC107',
      light: '#FFE16A',
      dark: '#B78103',
    },
    info: {
      main: '#1890FF',
      light: '#74CAFF',
      dark: '#0C53B7',
    },
    success: {
      main: '#54D62C',
      light: '#AAF27F',
      dark: '#229A16',
    },
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212B36',
      secondary: '#637381',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            '0px 0px 2px rgba(0, 0, 0, 0.05), 0px 2px 10px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

// Dark theme - adapting colors for dark mode
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#76B0F1', // Lighter shade of primary for dark mode
      light: '#B6D4F8',
      dark: '#2065D1',
    },
    secondary: {
      main: '#FF4081',
      light: '#FF79B0',
      dark: '#F50057',
    },
    error: {
      main: '#FF6B6B',
      light: '#FFA48D',
      dark: '#B72136',
    },
    warning: {
      main: '#FFD666',
      light: '#FFE16A',
      dark: '#B78103',
    },
    info: {
      main: '#74CAFF',
      light: '#A7DFFF',
      dark: '#1890FF',
    },
    success: {
      main: '#AAF27F',
      light: '#C9F7A8',
      dark: '#54D62C',
    },
    background: {
      default: '#161C24',
      paper: '#212B36',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#919EAB',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            '0px 0px 2px rgba(145, 158, 171, 0.2), 0px 2px 10px rgba(145, 158, 171, 0.12)',
          borderRadius: 12,
          backgroundColor: '#212B36',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
