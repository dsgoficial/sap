import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import { SubmitButton } from '../helpers'

const DialogoConfirmacao = ({ open = false, title = '', msg = '', onClose }) => {
  const [submitting, setSubmitting] = useState(false)

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    onClose && onClose(false)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    if (onClose) {
      await onClose(true)
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {msg}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='primary' disabled={submitting} autoFocus>
          Cancelar
        </Button>
        <SubmitButton onClick={handleConfirm} color='secondary' submitting={submitting}>
          Confirmar
        </SubmitButton>
      </DialogActions>
    </Dialog>
  )
}

export default DialogoConfirmacao
