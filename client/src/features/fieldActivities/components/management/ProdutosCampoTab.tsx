// Path: features\fieldActivities\components\management\ProdutosCampoTab.tsx
import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useSnackbar } from 'notistack';
import {
  useProdutosByCampo,
  useLotes,
  useProdutosByLote,
  useCreateAssociacoes,
  useDeleteAssociacoes,
} from '@/hooks/useFieldManagement';
import { AssociacaoInput } from '@/types/fieldActivities';
import ConfirmDialog from './ConfirmDialog';

interface ProdutosCampoTabProps {
  campoId: string;
}

export const ProdutosCampoTab = ({ campoId }: ProdutosCampoTabProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: associacoes = [], isLoading } = useProdutosByCampo(campoId);
  const { data: lotes = [] } = useLotes();

  const [loteId, setLoteId] = useState<number | null>(null);
  const [selectedProdutos, setSelectedProdutos] = useState<number[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const { data: produtosLote = [], isLoading: isLoadingProdutos } =
    useProdutosByLote(loteId);
  const createMutation = useCreateAssociacoes();
  const deleteMutation = useDeleteAssociacoes();

  const handleAdd = async () => {
    if (!selectedProdutos.length) return;
    const associacoes: AssociacaoInput[] = selectedProdutos.map(produtoId => ({
      campo_id: campoId,
      produto_id: produtoId,
    }));
    try {
      await createMutation.mutateAsync({ campoId, associacoes });
      enqueueSnackbar('Produtos associados com sucesso', { variant: 'success' });
      setSelectedProdutos([]);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Erro ao associar produtos';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleClear = async () => {
    try {
      await deleteMutation.mutateAsync(campoId);
      enqueueSnackbar('Associações removidas', { variant: 'success' });
    } catch {
      enqueueSnackbar('Erro ao remover associações', { variant: 'error' });
    } finally {
      setConfirmClear(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Adicionar produtos
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          label="Lote"
          value={loteId ?? ''}
          onChange={e => {
            setLoteId(Number(e.target.value));
            setSelectedProdutos([]);
          }}
          sx={{ minWidth: 220 }}
        >
          {lotes.map(lote => (
            <MenuItem key={lote.id} value={lote.id}>
              {lote.nome}
            </MenuItem>
          ))}
        </TextField>

        <FormControl sx={{ minWidth: 260, flex: 1 }} disabled={!loteId}>
          <InputLabel id="produtos-label">Produtos</InputLabel>
          <Select
            labelId="produtos-label"
            multiple
            value={selectedProdutos}
            onChange={e => setSelectedProdutos(e.target.value as number[])}
            input={<OutlinedInput label="Produtos" />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as number[]).map(id => {
                  const p = produtosLote.find(pr => pr.id === id);
                  return <Chip key={id} label={p?.nome ?? id} size="small" />;
                })}
              </Box>
            )}
          >
            {isLoadingProdutos && (
              <MenuItem disabled>Carregando produtos...</MenuItem>
            )}
            {!isLoadingProdutos && produtosLote.length === 0 && (
              <MenuItem disabled>Nenhum produto no lote</MenuItem>
            )}
            {produtosLote.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={!selectedProdutos.length}
          loading={createMutation.isPending}
        >
          Associar
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle1">
          Produtos associados ({associacoes.length})
        </Typography>
        {associacoes.length > 0 && (
          <Button
            color="error"
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setConfirmClear(true)}
          >
            Remover todos
          </Button>
        )}
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : associacoes.length === 0 ? (
        <Alert severity="info">Nenhum produto associado a este campo.</Alert>
      ) : (
        <List dense>
          {associacoes.map(a => (
            <ListItem key={a.id} divider>
              <ListItemText
                primary={a.produto_nome}
                secondary={`Lote: ${a.nome_lote}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Remover associações"
        message="Isso removerá TODAS as associações de produtos deste campo. Deseja continuar?"
        confirmLabel="Remover todos"
        isSubmitting={deleteMutation.isPending}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleClear}
      />
    </Box>
  );
};

export default ProdutosCampoTab;
