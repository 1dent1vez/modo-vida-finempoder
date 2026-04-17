// FinEmpoder Design System — FECard Component
// Card layout primitive with 3 density variants: flat, elevated, hero.

import { Paper, type PaperProps } from '@mui/material';
import { tokens } from '../theme';

type CardVariant = 'flat' | 'elevated' | 'hero';

interface FECardProps extends Omit<PaperProps, 'variant'> {
  /** Visual variant: flat (bordered), elevated (shadow), hero (prominent) */
  variant?: CardVariant;
  /** Whether the card is clickable (adds hover effect + cursor) */
  clickable?: boolean;
}

const variantStyles: Record<CardVariant, object> = {
  flat: {
    p: 4,             // space.4 = 16px
    borderRadius: 3,  // radius.md = 12px
    boxShadow: tokens.shadows.none,
    border: `1px solid ${tokens.neutrals.borderSubtle}`,
  },
  elevated: {
    p: 4,
    borderRadius: 3,
    boxShadow: tokens.shadows.sm,
    border: 'none',
  },
  hero: {
    p: 6,             // space.6 = 24px
    borderRadius: 4,  // radius.lg = 16px
    boxShadow: tokens.shadows.md,
    border: 'none',
  },
};

const clickableStyles = {
  cursor: 'pointer',
  transition: `box-shadow ${tokens.motion.fast} ${tokens.motion.easing.standard}`,
  '&:hover': {
    boxShadow: tokens.shadows.md,
  },
  '&:active': {
    boxShadow: tokens.shadows.sm,
  },
};

export default function FECard({
  variant = 'flat',
  clickable = false,
  children,
  sx,
  ...rest
}: FECardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        ...variantStyles[variant],
        ...(clickable ? clickableStyles : {}),
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Paper>
  );
}
