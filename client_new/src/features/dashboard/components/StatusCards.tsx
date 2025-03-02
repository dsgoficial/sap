// Path: features\dashboard\components\StatusCards.tsx
import { Grid, Paper, Typography, Box, LinearProgress } from '@mui/material';
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
  height: 200,
  justifyContent: 'center',
  alignItems: 'center',
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

export const StatusCards = ({ data, isLoading }: StatusCardsProps) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StyledPaper elevation={2}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Total de Produtos
          </Typography>
          {isLoading ? (
            <Box sx={{ width: '60%', mt: 2 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Typography variant="h3" color="text.primary">
              {data.totalProducts.toLocaleString()}
            </Typography>
          )}
        </StyledPaper>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledPaper elevation={2}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Porcentagem Concluída
          </Typography>
          {isLoading ? (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h3" color="text.primary" gutterBottom>
                {data.progressPercentage.toFixed(2)}%
              </Typography>
              <ProgressContainer>
                <LinearProgress
                  variant="determinate"
                  value={data.progressPercentage}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </ProgressContainer>
            </>
          )}
        </StyledPaper>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledPaper elevation={2}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Produtos Concluídos
          </Typography>
          {isLoading ? (
            <Box sx={{ width: '60%', mt: 2 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Typography variant="h3" color="text.primary">
              {data.completedProducts.toLocaleString()}
            </Typography>
          )}
        </StyledPaper>
      </Grid>
    </Grid>
  );
};
