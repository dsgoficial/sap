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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reportar Problema</DialogTitle>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
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
                  rows={4}
                  fullWidth
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            variant="contained"
            color="primary"
          >
            Enviar
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
