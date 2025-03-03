// Path: features\dashboard\components\StatusCards.tsx
import {
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DashboardSummary } from '@/types/dashboard';

interface StatusCardsProps {
  data: DashboardSummary;
  isLoading: boolean;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  minHeight: 150,
  height: 'auto',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    minHeight: 120,
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1),
  },
}));

export const StatusCards = ({ data, isLoading }: StatusCardsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid item xs={12} md={4}>
        <StyledPaper elevation={2}>
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            color="text.secondary"
            gutterBottom
            align="center"
          >
            Total de Produtos
          </Typography>
          {isLoading ? (
            <Box sx={{ width: '60%', mt: 2 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Typography variant={isMobile ? 'h4' : 'h3'} color="text.primary">
              {data.totalProducts.toLocaleString()}
            </Typography>
          )}
        </StyledPaper>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledPaper elevation={2}>
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            color="text.secondary"
            gutterBottom
            align="center"
          >
            Porcentagem Concluída
          </Typography>
          {isLoading ? (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress />
            </Box>
          ) : (
            <>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                color="text.primary"
                gutterBottom
              >
                {data.progressPercentage.toFixed(2)}%
              </Typography>
              <ProgressContainer>
                <LinearProgress
                  variant="determinate"
                  value={data.progressPercentage}
                  sx={{
                    height: isMobile ? 6 : 10,
                    borderRadius: 1,
                  }}
                />
              </ProgressContainer>
            </>
          )}
        </StyledPaper>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledPaper elevation={2}>
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            color="text.secondary"
            gutterBottom
            align="center"
          >
            Produtos Concluídos
          </Typography>
          {isLoading ? (
            <Box sx={{ width: '60%', mt: 2 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Typography variant={isMobile ? 'h4' : 'h3'} color="text.primary">
              {data.completedProducts.toLocaleString()}
            </Typography>
          )}
        </StyledPaper>
      </Grid>
    </Grid>
  );
};
