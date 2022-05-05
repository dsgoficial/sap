import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function FinishActivityForm({ open, setOpen, onSubmit }) {

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Atenção</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Deseja finalizar a atividade?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Não</Button>
                <Button onClick={()=>{
                    onSubmit()
                    handleClose()
                }}>Sim</Button>
            </DialogActions>
        </Dialog>
    );
}
