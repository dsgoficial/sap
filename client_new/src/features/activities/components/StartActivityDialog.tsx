// Path: features\activities\components\StartActivityDialog.tsx
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogContentText, 
    DialogActions, 
    Button 
  } from '@mui/material';
  import { LoadingButton } from '@mui/lab';
  
  interface StartActivityDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
  }
  
  export const StartActivityDialog = ({ 
    open, 
    onClose, 
    onConfirm, 
    isSubmitting 
  }: StartActivityDialogProps) => {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Atenção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja iniciar a próxima atividade?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Não
          </Button>
          <LoadingButton 
            onClick={onConfirm} 
            loading={isSubmitting}
            variant="contained"
          >
            Sim
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };