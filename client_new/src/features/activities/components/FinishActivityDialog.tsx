// Path: features\activities\components\FinishActivityDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface FinishActivityDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const FinishActivityDialog = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
}: FinishActivityDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Atenção</DialogTitle>
      <DialogContent>
        <DialogContentText>Deseja finalizar a atividade?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Não
        </Button>
        <LoadingButton
          onClick={onConfirm}
          loading={isSubmitting}
          variant="contained"
          color="success"
        >
          Sim
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
