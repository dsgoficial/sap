// Path: components\ui\Button.tsx
import React, { forwardRef, ReactNode } from 'react';
import { 
  Button as MuiButton, 
  ButtonProps as MuiButtonProps,
  styled,
  alpha
} from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  children: ReactNode;
  isLoading?: boolean;
}

const StyledButton = styled(MuiButton)(({ theme, color = 'primary', variant = 'contained' }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius,
  boxShadow: variant === 'contained' ? theme.shadows[2] : 'none',
  padding: '8px 16px',
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    boxShadow: variant === 'contained' ? theme.shadows[4] : 'none',
    ...(variant === 'outlined' && {
      backgroundColor: alpha(theme.palette[color].main, 0.08),
    }),
  },
  '&:disabled': {
    boxShadow: 'none',
  },
}));

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, disabled, ...rest }, ref) => {
    return (
      <StyledButton
        ref={ref}
        disabled={disabled || isLoading}
        {...rest}
      >
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';