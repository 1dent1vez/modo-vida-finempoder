// FinEmpoder Design System — FinniMessage Component
// Reusable feedback component for the "Finni" coach character.
// Variants: info | success | warning | error | coach

import { Box, Stack, Typography, Button, type SxProps } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CelebrationIcon from '@mui/icons-material/Celebration';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BlockIcon from '@mui/icons-material/Block';
import PetsIcon from '@mui/icons-material/Pets';
import { tokens } from '../theme';

type FinniVariant = 'info' | 'success' | 'warning' | 'error' | 'coach';

interface FinniAction {
  label: string;
  onClick: () => void;
}

interface FinniMessageProps {
  variant?: FinniVariant;
  message: string;
  /** Optional title override. Default: "Finni dice:" */
  title?: string;
  /** Up to 2 action buttons */
  actions?: [FinniAction] | [FinniAction, FinniAction];
  /** Extra sx for the root container */
  sx?: SxProps;
}

const variantConfig: Record<
  FinniVariant,
  { icon: React.ReactNode; bg: string; border: string }
> = {
  info: {
    icon: <LightbulbIcon />,
    bg: tokens.status.infoBg,
    border: tokens.status.info,
  },
  success: {
    icon: <CelebrationIcon />,
    bg: tokens.status.successBg,
    border: tokens.status.success,
  },
  warning: {
    icon: <WarningAmberIcon />,
    bg: tokens.status.warningBg,
    border: tokens.status.warning,
  },
  error: {
    icon: <BlockIcon />,
    bg: tokens.status.errorBg,
    border: tokens.status.error,
  },
  coach: {
    icon: <PetsIcon />,
    bg: tokens.brand.accentBg,
    border: tokens.brand.accent,
  },
};

export default function FinniMessage({
  variant = 'coach',
  message,
  title = 'Finni dice:',
  actions,
  sx,
}: FinniMessageProps) {
  const cfg = variantConfig[variant];

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        p: 4, // space.4 = 16px
        borderRadius: 3, // radius.md = 12px
        borderLeft: `4px solid ${cfg.border}`,
        bgcolor: cfg.bg,
        ...sx,
      }}
    >
      <Stack direction="row" spacing={3} alignItems="flex-start">
        {/* Avatar / Icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: tokens.shadows.sm,
            color: cfg.border,
          }}
        >
          {cfg.icon}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            {title}
          </Typography>
          <Typography variant="body1">{message}</Typography>

          {actions && actions.length > 0 && (
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              {actions.map((action, i) => (
                <Button
                  key={i}
                  size="small"
                  variant="text"
                  onClick={action.onClick}
                  sx={{ fontWeight: 600 }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
