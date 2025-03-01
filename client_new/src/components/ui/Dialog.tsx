// Path: components\ui\Dialog.tsx
import React, { ReactNode, forwardRef } from 'react';
import {
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Typography,
  styled,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface DialogProps extends Omit<MuiDialogProps, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  actions?: ReactNode;
  closeButton?: boolean;
  onClose: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
}));

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ 
    title, 
    description, 
    content, 
    actions, 
    closeButton = true, 
    onClose,
    children,
    maxWidth = 'sm',
    ...rest 
  }, ref) => {
    // If direct children are provided, render them instead of using the Dialog structure
    if (children) {
      return (
        <MuiDialog
          ref={ref}
          onClose={onClose}
          maxWidth={maxWidth}
          fullWidth
          {...rest}
        >
          {children}
        </MuiDialog>
      );
    }

    return (
      <MuiDialog
        ref={ref}
        onClose={onClose}
        maxWidth={maxWidth}
        fullWidth
        {...rest}
      >
        {title && (
          <StyledDialogTitle>
            {typeof title === 'string' ? (
              <Typography variant="h6">{title}</Typography>
            ) : (
              title
            )}
            
            {closeButton && (
              <IconButton
                aria-label="close"
                onClick={onClose}
                size="small"
                edge="end"
              >
                <CloseIcon />
              </IconButton>
            )}
          </StyledDialogTitle>
        )}
        
        <DialogContent>
          {description && (
            <DialogContentText sx={{ mb: 2 }}>
              {description}
            </DialogContentText>
          )}
          
          {content && <Box>{content}</Box>}
        </DialogContent>
        
        {actions && (
          <DialogActions>
            {actions}
          </DialogActions>
        )}
      </MuiDialog>
    );
  }
);

Dialog.displayName = 'Dialog';