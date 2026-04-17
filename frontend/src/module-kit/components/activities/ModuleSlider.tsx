// FinEmpoder — ModuleSlider
// Wrapper de Slider MUI con chip de resultado reactivo.
// Para ejercicios de porcentaje (presupuesto, ahorro, inversión).

import { Box, Chip, Slider, Stack, Typography } from '@mui/material';
import type { ModuleColorValue } from '../../../theme';

export type SliderColor = ModuleColorValue | 'primary';

export interface ModuleSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** Unidad mostrada junto al valor, ej. "%" o "$" */
  unit?: string;
  /** Etiqueta dinámica calculada externamente según el valor */
  resultLabel?: string;
  /** Color del Slider y el Chip (default: 'primary') */
  color?: SliderColor;
}

export function ModuleSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
  resultLabel,
  color = 'primary' as SliderColor,
}: ModuleSliderProps) {
  const isPrimary = color === 'primary';

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`${value}${unit}`}
            color={isPrimary ? 'primary' : color}
            size="small"
            sx={{ fontWeight: 700, minWidth: 56, justifyContent: 'center' }}
          />
          {resultLabel && (
            <Typography variant="caption" color="text.secondary">
              {resultLabel}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(_, v) => onChange(v as number)}
        color="primary"
        sx={
          !isPrimary
            ? {
                color: `${color}.main`,
                '& .MuiSlider-thumb': { bgcolor: `${color}.main` },
                '& .MuiSlider-track': { bgcolor: `${color}.main` },
              }
            : undefined
        }
      />

      <Stack direction="row" justifyContent="space-between">
        <Typography variant="caption" color="text.disabled">
          {min}{unit}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {max}{unit}
        </Typography>
      </Stack>
    </Box>
  );
}
