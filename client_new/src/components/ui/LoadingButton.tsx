// Path: components\ui\LoadingButton.tsx
import { ReactNode } from 'react';
import { LoadingButton as MuiLoadingButton } from '@mui/lab';
import { ButtonProps as MuiButtonProps } from '@mui/material';

interface LoadingButtonProps extends Omit<MuiButtonProps, 'loading'> {
  loading?: boolean;
  children: ReactNode;
}

export const LoadingButton = ({ 
  loading = false, 
  disabled = false,
  children,
  ...props 
}: LoadingButtonProps) => {
  return (
    <MuiLoadingButton
      loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </MuiLoadingButton>
  );
};