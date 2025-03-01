// Path: features\dashboard\components\DashboardSummary.tsx
import { Grid, Paper, Typography, Box, LinearProgress, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DashboardSummary as DashboardSummaryType } from '../../../types/dashboard';
import { formatNumber, formatPercent } from '../../../utils/formatters';

interface DashboardSummaryProps {
  data: DashboardSummaryType;
  isLoading: boolean;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: 200,
  justifyContent: 'center',
  alignItems: 'center'
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2)
}));

export const DashboardSummary = ({ data, isLoading }: DashboardSummaryProps) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StyledPaper elevation={2}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Total de Produtos
          </Typography>
          {isLoading ? (
            <Box sx={{ width: '60%', mt: 2 }}>
              <Skeleton variant="text" height={40} />
            </Box>
          ) : (
            <Typography variant="h3" color="text.primary">
              {formatNumber(data.totalProducts)}
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
              <Skeleton variant="text" height={40} />
              <Skeleton variant="rectangular" height={10} sx={{ mt: 2 }} />
            </Box>
          ) : (
            <>
              <Typography variant="h3" color="text.primary" gutterBottom>
                {formatPercent(data.progressPercentage, 2)}
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
              <Skeleton variant="text" height={40} />
            </Box>
          ) : (
            <Typography variant="h3" color="text.primary">
              {formatNumber(data.completedProducts)}
            </Typography>
          )}
        </StyledPaper>
      </Grid>
    </Grid>
  );
};