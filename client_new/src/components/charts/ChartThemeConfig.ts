// Path: components\charts\ChartThemeConfig.ts
import { useTheme } from '@mui/material/styles';

/**
 * Hook to provide theme-aware colors for charts and data visualizations
 * Used to make charts respond to light/dark mode changes
 */
export const useChartColors = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return {
    // Base colors for charts
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,

    // Text colors
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,

    // Background colors
    background: theme.palette.background.default,
    paper: theme.palette.background.paper,

    // Status colors (for different chart elements)
    completed: isDark ? '#AAF27F' : '#54D62C',
    running: isDark ? '#74CAFF' : '#1890FF',
    notStarted: isDark ? '#919EAB' : '#637381',

    // Series colors for bar charts, pie charts, etc.
    seriesColors: [
      isDark ? '#76B0F1' : '#2065D1', // primary blue
      isDark ? '#FF9777' : '#FF4842', // error
      isDark ? '#FFD666' : '#FFC107', // warning
      isDark ? '#AAF27F' : '#54D62C', // success
      isDark ? '#CE93D8' : '#9C27B0', // purple
      isDark ? '#90CAF9' : '#1976D2', // blue
      isDark ? '#FFAB91' : '#F4511E', // orange
      isDark ? '#B39DDB' : '#673AB7', // deep purple
    ],

    // Grid and axis colors
    grid: isDark ? 'rgba(145, 158, 171, 0.24)' : 'rgba(145, 158, 171, 0.16)',
    axis: isDark ? 'rgba(145, 158, 171, 0.4)' : 'rgba(145, 158, 171, 0.32)',
  };
};
