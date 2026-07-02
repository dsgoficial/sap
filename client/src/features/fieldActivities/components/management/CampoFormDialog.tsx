// Path: features\fieldActivities\components\management\CampoFormDialog.tsx
import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  Box,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import {
  useSituacoes,
  useCategorias,
  useCreateCampo,
  useUpdateCampo,
} from '@/hooks/useFieldManagement';
import { Campo, CampoInput } from '@/types/fieldActivities';
import { toDateInputValue, dateInputToISO } from '@/utils/formatters';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  orgao: z.string().min(1, 'Órgão é obrigatório'),
  pit: z.coerce
    .number({ invalid_type_error: 'PIT deve ser um ano' })
    .int('PIT deve ser um ano')
    .min(1900, 'PIT inválido')
    .max(2100, 'PIT inválido'),
  militares: z.string().optional(),
  placas_vtr: z.string().optional(),
  inicio: z.string().optional(),
  fim: z.string().optional(),
  situacao_id: z.coerce
    .number({ invalid_type_error: 'Situação é obrigatória' })
    .int()
    .min(1, 'Situação é obrigatória'),
  categorias: z.array(z.string()),
});

type CampoFormValues = z.infer<typeof schema>;

interface CampoFormDialogProps {
  open: boolean;
  campo?: Campo | null; // se presente, modo edição
  onClose: () => void;
}

// ISO/timestamp -> 'yyyy-MM-dd' para input date, no fuso LOCAL
// (toISOString() deslocaria o dia em UTC-3).
const toDateInput = (value?: string | null): string => toDateInputValue(value);

const emptyValues: CampoFormValues = {
  nome: '',
  descricao: '',
  orgao: '',
  pit: new Date().getFullYear(),
  militares: '',
  placas_vtr: '',
  inicio: '',
  fim: '',
  situacao_id: 1,
  categorias: [],
};

export const CampoFormDialog = ({
  open,
  campo,
  onClose,
}: CampoFormDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = !!campo;

  const { data: situacoes = [] } = useSituacoes();
  const { data: categorias = [] } = useCategorias();
  const createMutation = useCreateCampo();
  const updateMutation = useUpdateCampo();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CampoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  // Reinicializa o formulário ao abrir/trocar de campo
  useEffect(() => {
    if (!open) return;
    if (campo) {
      reset({
        nome: campo.nome ?? '',
        descricao: campo.descricao ?? '',
        orgao: campo.orgao ?? '',
        pit: campo.pit ?? new Date().getFullYear(),
        militares: campo.militares ?? '',
        placas_vtr: campo.placas_vtr ?? '',
        inicio: toDateInput(campo.inicio),
        fim: toDateInput(campo.fim),
        situacao_id: campo.situacao_id ?? 1,
        categorias: campo.categorias ?? [],
      });
    } else {
      reset(emptyValues);
    }
  }, [open, campo, reset]);

  const onSubmit = async (values: CampoFormValues) => {
    const payload: CampoInput = {
      nome: values.nome,
      descricao: values.descricao ? values.descricao : null,
      orgao: values.orgao,
      pit: values.pit,
      militares: values.militares ? values.militares : null,
      placas_vtr: values.placas_vtr ? values.placas_vtr : null,
      // Meia-noite LOCAL: new Date('YYYY-MM-DD') seria meia-noite UTC e
      // gravaria 21:00 do dia anterior em UTC-3.
      inicio: dateInputToISO(values.inicio),
      fim: dateInputToISO(values.fim),
      situacao_id: values.situacao_id,
      categorias: values.categorias,
    };

    try {
      if (isEdit && campo) {
        await updateMutation.mutateAsync({ id: campo.id, campo: payload });
        enqueueSnackbar('Campo atualizado com sucesso', { variant: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        enqueueSnackbar('Campo criado com sucesso', { variant: 'success' });
      }
      onClose();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro ao salvar campo';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome"
                fullWidth
                required
                error={!!errors.nome}
                helperText={errors.nome?.message}
                {...register('nome')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="PIT (ano)"
                type="number"
                fullWidth
                required
                error={!!errors.pit}
                helperText={errors.pit?.message}
                {...register('pit')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descrição"
                fullWidth
                multiline
                minRows={2}
                error={!!errors.descricao}
                helperText={errors.descricao?.message}
                {...register('descricao')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Órgão"
                fullWidth
                required
                error={!!errors.orgao}
                helperText={errors.orgao?.message}
                {...register('orgao')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="situacao_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Situação"
                    select
                    fullWidth
                    required
                    error={!!errors.situacao_id}
                    helperText={errors.situacao_id?.message}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(Number(e.target.value))}
                  >
                    {situacoes.map(s => (
                      <MenuItem key={s.code} value={s.code}>
                        {s.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Militares"
                fullWidth
                multiline
                minRows={1}
                {...register('militares')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Placas das viaturas"
                fullWidth
                {...register('placas_vtr')}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Início"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('inicio')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fim"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('fim')}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="categorias"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.categorias}>
                    <InputLabel id="categorias-label">Categorias</InputLabel>
                    <Select
                      labelId="categorias-label"
                      multiple
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      input={<OutlinedInput label="Categorias" />}
                      renderValue={selected => (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                        >
                          {(selected as string[]).map(value => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {categorias.map(c => (
                        <MenuItem key={c.categoria} value={c.categoria}>
                          {c.categoria}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.categorias && (
                      <FormHelperText>
                        {errors.categorias.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CampoFormDialog;
