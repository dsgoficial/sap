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
  const isDarkMode = theme.palette.mode === 'dark';
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
      const response = await startActivity();
      // Use the message from the API response
      enqueueSnackbar(response.message || 'Atividade iniciada com sucesso', {
        variant: 'success',
      });
      setShowStartDialog(false);
    } catch (error) {
      handleActivityError(error, 'Falha ao iniciar atividade');
      setShowStartDialog(false);
    }
  };

  const handleFinishActivity = async () => {
    if (!currentActivity?.id) return;

    try {
      const response = await finishActivity(currentActivity.id);
      enqueueSnackbar(response.message || 'Atividade finalizada com sucesso', {
        variant: 'success',
      });
      setShowFinishDialog(false);
    } catch (error) {
      handleActivityError(error, 'Falha ao finalizar atividade');
      setShowFinishDialog(false);
    }
  };

  const handleReportError = async (errorData: ErrorReport) => {
    try {
      const response = await reportError(errorData);
      enqueueSnackbar(response.message || 'Problema reportado com sucesso', {
        variant: 'success',
      });
      setShowErrorDialog(false);
    } catch (error) {
      handleActivityError(error, 'Falha ao reportar problema');
      setShowErrorDialog(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          transition: theme.transitions.create(
            ['box-shadow', 'background-color'],
            { duration: theme.transitions.duration.standard },
          ),
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 2px 10px rgba(0,0,0,0.1)',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          {isLoadingActivity ? (
            <CircularProgress
              size={24}
              sx={{
                my: 1,
                color: isDarkMode ? 'primary.light' : 'primary.main',
              }}
            />
          ) : (
            <Typography
              variant="h6"
              sx={{
                color: isDarkMode ? 'text.primary' : 'inherit',
                fontWeight: 'medium',
              }}
            >
              {currentActivity?.nome || 'Sem atividade atual'}
            </Typography>
          )}
        </CardContent>

        <CardActions
          sx={{
            justifyContent: 'center',
            p: isMobile ? 1 : 2,
            flexDirection: isMobile ? 'column' : 'row',
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
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
                  sx={{
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : undefined,
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : undefined,
                    },
                  }}
                >
                  {isStartingActivity ? 'Iniciando...' : 'Iniciar Atividade'}
                </Button>
              </ButtonGroup>
            )}

            {currentActivity && activityByQgis && (
              <Alert
                severity="warning"
                sx={{
                  bgcolor: isDarkMode ? 'rgba(237, 108, 2, 0.1)' : undefined,
                  color: isDarkMode ? 'warning.light' : undefined,
                  '& .MuiAlert-icon': {
                    color: isDarkMode ? 'warning.light' : undefined,
                  },
                }}
              >
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
                  sx={{
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : undefined,
                    '&:hover': {
                      bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : undefined,
                    },
                  }}
                >
                  Reportar Problema
                </Button>
                <Button
                  onClick={() => setShowFinishDialog(true)}
                  disabled={isFinishingActivity}
                  fullWidth={isMobile}
                  color="success"
                  sx={{
                    bgcolor: isDarkMode ? 'rgba(46, 125, 50, 0.1)' : undefined,
                    '&:hover': {
                      bgcolor: isDarkMode
                        ? 'rgba(46, 125, 50, 0.2)'
                        : undefined,
                    },
                  }}
                >
                  {isFinishingActivity ? 'Finalizando...' : 'Finalizar'}
                </Button>
              </ButtonGroup>
            )}

            {activityError && (
              <Alert
                severity="error"
                sx={{
                  bgcolor: isDarkMode ? 'rgba(211, 47, 47, 0.1)' : undefined,
                  color: isDarkMode ? 'error.light' : undefined,
                  '& .MuiAlert-icon': {
                    color: isDarkMode ? 'error.light' : undefined,
                  },
                }}
              >
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
