// Path: lib\theme.ts
import { createTheme } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
  palette: {
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
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    // ... other shadows (customized as needed)
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.05), 0px 2px 10px rgba(0, 0, 0, 0.05)',
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

export default theme;