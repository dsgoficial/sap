// Path: components\ui\Card.tsx
import React, { forwardRef, ReactNode } from 'react';
import { 
  Card as MuiCard, 
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  styled
} from '@mui/material';

export interface CardProps extends MuiCardProps {
  title?: string;
  subheader?: string;
  content?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  contentPadding?: number | string;
  elevation?: number;
}

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.standard,
  }),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    title, 
    subheader, 
    content, 
    actions, 
    children, 
    contentPadding = 2, 
    elevation = 1, 
    ...rest 
  }, ref) => {
    // If direct children are provided, render them instead of using the Card structure
    if (children) {
      return (
        <StyledCard ref={ref} elevation={elevation} {...rest}>
          {children}
        </StyledCard>
      );
    }

    return (
      <StyledCard ref={ref} elevation={elevation} {...rest}>
        {title && (
          <CardHeader
            title={<Typography variant="h6">{title}</Typography>}
            subheader={subheader && <Typography variant="body2" color="text.secondary">{subheader}</Typography>}
          />
        )}
        
        {content && (
          <CardContent sx={{ p: contentPadding }}>
            {content}
          </CardContent>
        )}
        
        {actions && (
          <CardActions>
            {actions}
          </CardActions>
        )}
      </StyledCard>
    );
  }
);

Card.displayName = 'Card';