// Path: features\activities\components\ReportErrorDialog.tsx
import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ErrorReport, ErrorType } from '@/types/activity';
import { useActivities } from '@/hooks/useActivities';

// Form validation schema
const errorReportSchema = z.object({
  tipo_problema_id: z.number({
    required_error: 'Escolha o tipo de problema',
    invalid_type_error: 'Escolha o tipo de problema',
  }),
  descricao: z.string().min(5, 'A descrição deve ter pelo menos 5 caracteres'),
});

type ErrorReportForm = z.infer<typeof errorReportSchema>;

interface ReportErrorDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ErrorReport) => void;
  isSubmitting: boolean;
}

export const ReportErrorDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: ReportErrorDialogProps) => {
  const { currentActivity, errorTypes } = useActivities();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ErrorReportForm>({
    resolver: zodResolver(errorReportSchema),
    defaultValues: {
      tipo_problema_id: 0,
      descricao: '',
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        tipo_problema_id: 0,
        descricao: '',
      });
    }
  }, [open, reset]);

  const onFormSubmit = (data: ErrorReportForm) => {
    if (!currentActivity?.id) return;

    onSubmit({
      atividade_id: currentActivity.id,
      ...data,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      scroll="paper"
      aria-labelledby="report-problem-dialog-title"
    >
      <DialogTitle
        id="report-problem-dialog-title"
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Reportar Problema</Typography>
        {fullScreen && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: theme => theme.palette.grey[500],
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent dividers sx={{ p: fullScreen ? 2 : 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              pt: fullScreen ? 0 : 1,
            }}
          >
            <Controller
              name="tipo_problema_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo_problema_id}>
                  <InputLabel id="error-type-label">
                    Tipo de Problema
                  </InputLabel>
                  <Select
                    {...field}
                    labelId="error-type-label"
                    label="Tipo de Problema"
                    value={field.value || ''}
                    variant={fullScreen ? 'outlined' : 'standard'}
                    sx={{ mb: 1 }}
                  >
                    <MenuItem value={0} disabled>
                      Selecione o tipo de problema
                    </MenuItem>
                    {Array.isArray(errorTypes) &&
                      errorTypes.map((type: ErrorType) => (
                        <MenuItem
                          key={type.tipo_problema_id}
                          value={type.tipo_problema_id}
                        >
                          {type.tipo_problema}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.tipo_problema_id && (
                    <FormHelperText>
                      {errors.tipo_problema_id.message}
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="descricao"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição"
                  multiline
                  rows={fullScreen ? 6 : 4}
                  fullWidth
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message}
                  variant={fullScreen ? 'outlined' : 'standard'}
                  placeholder="Descreva o problema em detalhes para melhor compreensão..."
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            color="inherit"
            variant={fullScreen ? 'outlined' : 'text'}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            variant="contained"
            color="primary"
          >
            Enviar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
