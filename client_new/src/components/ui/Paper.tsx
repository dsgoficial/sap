// Path: components\ui\Paper.tsx
import React, { forwardRef, ReactNode } from 'react';
import { 
  Paper as MuiPaper, 
  PaperProps as MuiPaperProps,
  styled
} from '@mui/material';

export interface PaperProps extends MuiPaperProps {
  children: ReactNode;
  contentPadding?: number | string;
  borderRadius?: number;
  hoverElevation?: number;
}

const StyledPaper = styled(MuiPaper, {
  shouldForwardProp: (prop) => 
    prop !== 'contentPadding' && prop !== 'borderRadius' && prop !== 'hoverElevation'
})<{ 
  contentPadding: number | string; 
  borderRadius: number;
  hoverElevation: number;
}>(({ theme, contentPadding, borderRadius, hoverElevation }) => ({
  padding: theme.spacing(contentPadding),
  borderRadius: theme.shape.borderRadius * borderRadius,
  transition: theme.transitions.create(['box-shadow']),
  '&:hover': {
    boxShadow: hoverElevation > 0 ? theme.shadows[hoverElevation] : undefined,
  },
}));

export const Paper = forwardRef<HTMLDivElement, PaperProps>(
  ({ 
    children, 
    contentPadding = 2, 
    borderRadius = 1, 
    elevation = 1,
    hoverElevation = 0,
    ...rest 
  }, ref) => {
    return (
      <StyledPaper
        ref={ref}
        elevation={elevation}
        contentPadding={contentPadding}
        borderRadius={borderRadius}
        hoverElevation={hoverElevation}
        {...rest}
      >
        {children}
      </StyledPaper>
    );
  }
);

Paper.displayName = 'Paper';