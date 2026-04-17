// FinEmpoder — OptionCard
// Reemplaza los Button ad-hoc de opción múltiple en lecciones.
// Muestra feedback visual post-respuesta con ícono ✓/✗ y Fade.

import { Box, Collapse, Fade, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export interface OptionCardProps {
  label: string;
  selected: boolean;
  /** true = respuesta correcta (mostrar tras responder) */
  correct?: boolean;
  /** true = respuesta incorrecta (mostrar tras responder) */
  incorrect?: boolean;
  /** Explicación que aparece con Collapse tras responder */
  explanation?: string;
  onSelect: () => void;
  disabled?: boolean;
}

export function OptionCard({
  label,
  selected,
  correct,
  incorrect,
  explanation,
  onSelect,
  disabled = false,
}: OptionCardProps) {
  const answered = correct === true || incorrect === true;

  const borderColor = correct
    ? 'success.main'
    : incorrect
    ? 'error.main'
    : selected
    ? 'primary.main'
    : 'divider';

  const bgcolor = correct
    ? 'success.light'
    : incorrect
    ? 'error.light'
    : selected
    ? 'primary.main'
    : 'background.paper';

  const textColor = selected && !answered ? 'primary.contrastText' : 'text.primary';

  return (
    <Box>
      <Box
        component="button"
        onClick={disabled ? undefined : onSelect}
        sx={{
          width: '100%',
          textAlign: 'left',
          cursor: disabled ? 'default' : 'pointer',
          border: '2px solid',
          borderColor,
          borderRadius: 2,
          bgcolor,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          transition: 'all 150ms ease',
          outline: 'none',
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
          '&:hover:not(:disabled)': !disabled && !answered
            ? { borderColor: 'primary.main', bgcolor: 'primary.light' }
            : {},
        }}
      >
        <Typography variant="body1" color={textColor} fontWeight={selected ? 600 : 400}>
          {label}
        </Typography>

        {answered && (
          <Fade in>
            <Stack direction="row" alignItems="center">
              {correct && <CheckCircleIcon color="success" />}
              {incorrect && <CancelIcon color="error" />}
            </Stack>
          </Fade>
        )}
      </Box>

      {/* Explicación con Collapse post-respuesta */}
      <Collapse in={answered && !!explanation && (correct === true || incorrect === true)}>
        <Box
          sx={{
            mt: 1,
            p: 2,
            borderRadius: 2,
            bgcolor: correct ? 'success.light' : 'error.light',
            border: '1px solid',
            borderColor: correct ? 'success.main' : 'error.main',
          }}
        >
          <Typography variant="body2" color={correct ? 'success.dark' : 'error.dark'}>
            {explanation}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
