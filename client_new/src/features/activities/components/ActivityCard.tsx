// Path: features\activities\components\ActivityCard.tsx
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  ButtonGroup,
  Box,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useActivities } from '@/hooks/useActivities';
import { useActivityErrorHandler } from '@/services/activityService';
import { StartActivityDialog } from './StartActivityDialog';
import { FinishActivityDialog } from './FinishActivityDialog';
import { ReportErrorDialog } from './ReportErrorDialog';
import { ErrorReport } from '@/types/activity';

export const ActivityCard = () => {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { handleActivityError } = useActivityErrorHandler();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    currentActivity,
    activityByQgis,
    isLoadingActivity,
    isStartingActivity,
    isFinishingActivity,
    isReportingError,
    activityError,
    startActivity,
    finishActivity,
    reportError,
  } = useActivities();

  const handleStartActivity = async () => {
    try {
      await startActivity();
      enqueueSnackbar('Atividade iniciada com sucesso', { variant: 'success' });
      setShowStartDialog(false);
    } catch (error) {
      handleActivityError(error, 'Falha ao iniciar atividade');
    }
  };

  const handleFinishActivity = async () => {
    if (!currentActivity?.id) return;

    try {
      await finishActivity(currentActivity.id);
      enqueueSnackbar('Atividade finalizada com sucesso', {
        variant: 'success',
      });
      setShowFinishDialog(false);
    } catch (error) {
      handleActivityError(error, 'Falha ao finalizar atividade');
    }
  };

  const handleReportError = async (errorData: ErrorReport) => {
    try {
      await reportError(errorData);
      enqueueSnackbar('Problema reportado com sucesso', { variant: 'success' });
      setShowErrorDialog(false);
    } catch (error) {
      handleActivityError(error, 'Falha ao reportar problema');
    }
  };

  return (
    <>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          {isLoadingActivity ? (
            <CircularProgress size={24} sx={{ my: 1 }} />
          ) : (
            <Typography variant="h6">
              {currentActivity?.nome || 'Sem atividade atual'}
            </Typography>
          )}
        </CardContent>

        <CardActions
          sx={{
            justifyContent: 'center',
            p: isMobile ? 1 : 2,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? 1 : 2,
            }}
          >
            {!isLoadingActivity && !currentActivity && (
              <ButtonGroup
                variant="outlined"
                sx={{
                  alignSelf: 'center',
                  width: isMobile ? '100%' : 'auto',
                }}
                orientation={isMobile ? 'vertical' : 'horizontal'}
              >
                <Button
                  onClick={() => setShowStartDialog(true)}
                  disabled={isStartingActivity}
                  fullWidth={isMobile}
                >
                  {isStartingActivity ? 'Iniciando...' : 'Iniciar Atividade'}
                </Button>
              </ButtonGroup>
            )}

            {currentActivity && activityByQgis && (
              <Alert severity="warning">
                Use o QGIS para acessar atividade!
              </Alert>
            )}

            {currentActivity && !activityByQgis && (
              <ButtonGroup
                variant="outlined"
                sx={{
                  alignSelf: 'center',
                  width: isMobile ? '100%' : 'auto',
                }}
                orientation={isMobile ? 'vertical' : 'horizontal'}
              >
                <Button
                  onClick={() => setShowErrorDialog(true)}
                  disabled={isReportingError}
                  fullWidth={isMobile}
                >
                  Reportar Problema
                </Button>
                <Button
                  onClick={() => setShowFinishDialog(true)}
                  disabled={isFinishingActivity}
                  fullWidth={isMobile}
                >
                  {isFinishingActivity ? 'Finalizando...' : 'Finalizar'}
                </Button>
              </ButtonGroup>
            )}

            {activityError && (
              <Alert severity="error">
                Erro ao carregar atividade. Por favor, tente novamente.
              </Alert>
            )}
          </Box>
        </CardActions>
      </Card>

      <StartActivityDialog
        open={showStartDialog}
        onClose={() => setShowStartDialog(false)}
        onConfirm={handleStartActivity}
        isSubmitting={isStartingActivity}
      />

      <FinishActivityDialog
        open={showFinishDialog}
        onClose={() => setShowFinishDialog(false)}
        onConfirm={handleFinishActivity}
        isSubmitting={isFinishingActivity}
      />

      <ReportErrorDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        onSubmit={handleReportError}
        isSubmitting={isReportingError}
      />
    </>
  );
};
