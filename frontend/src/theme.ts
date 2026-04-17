// FinEmpoder Design System — Theme Tokens
// All visual decisions centralized here. Zero hardcoded values in components.

import { createTheme, type ThemeOptions } from '@mui/material/styles';

/* ─── Color Tokens ──────────────────────────────────────── */
const brand = {
  primary: '#1B4FD8',      // Azul índigo — acción principal, progreso
  primaryLight: '#4B73F0',
  primaryDark: '#0F2F8A',
  secondary: '#F59E0B',    // Ámbar — logros, gamificación, XP
  secondaryLight: '#FCD34D',
  secondaryDark: '#B45309',
  // Legacy accent aliases (kept for backwards compatibility)
  accent: '#F59E0B',
  accentDark: '#B45309',
  accentBg: '#FEF3C7',
} as const;

const status = {
  success: '#10B981',      // Verde esmeralda — Ahorro, lección completada
  successBg: '#D1FAE5',
  warning: '#F59E0B',      // Ámbar — Presupuesto
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  info: '#4B73F0',         // Variante light del azul índigo — Inversión
  infoBg: '#EEF2FF',
} as const;

const neutrals = {
  textPrimary: '#0F172A',   // Slate 900 — máxima legibilidad
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8',     // Slate 400
  bgApp: '#F8FAFC',         // Slate 50 — no blanco puro (cansa en móvil)
  bgSurface: '#FFFFFF',
  borderDefault: '#E5E7EB',
  borderSubtle: '#F3F4F6',
} as const;

/* ─── Module Colors ─────────────────────────────────────── */
// Color canónico por módulo — usar como color prop en componentes MUI
export const PRESUPUESTO_COLOR = 'warning' as const;
export const AHORRO_COLOR = 'success' as const;
export const INVERSION_COLOR = 'info' as const;

export const MODULE_COLORS = {
  presupuesto: PRESUPUESTO_COLOR,
  ahorro: AHORRO_COLOR,
  inversion: INVERSION_COLOR,
} as const;

export type ModuleId = keyof typeof MODULE_COLORS;
export type ModuleColorValue = (typeof MODULE_COLORS)[ModuleId];

/* ─── Spacing Scale (px) ────────────────────────────────── */
// MUI spacing factor = 4px → space.1=4, space.2=8, etc.
// Use via theme.spacing(1) through theme.spacing(12)

/* ─── Radii Tokens ──────────────────────────────────────── */
const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

/* ─── Shadow Tokens ─────────────────────────────────────── */
const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 8px 24px rgba(0,0,0,0.12)',
} as const;

/* ─── Motion Tokens ─────────────────────────────────────── */
export const motion = {
  fast: '120ms',
  base: '200ms',
  slow: '350ms',
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    enter: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

/* ─── Control Sizes ─────────────────────────────────────── */
export const controls = {
  minTap: 44,
  inputHeight: 48,
  buttonHeight: { sm: 36, md: 44, lg: 52 },
} as const;

/* ─── Theme Options ─────────────────────────────────────── */
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: brand.primary,
      light: brand.primaryLight,
      dark: brand.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brand.secondary,
      light: brand.secondaryLight,
      dark: brand.secondaryDark,
      contrastText: '#000000',
    },
    success: { main: status.success, light: status.successBg },
    warning: { main: status.warning, light: status.warningBg },
    error: { main: status.error, light: status.errorBg },
    info: { main: status.info, light: status.infoBg },
    text: {
      primary: neutrals.textPrimary,
      secondary: neutrals.textSecondary,
      disabled: neutrals.textMuted,
    },
    background: {
      default: neutrals.bgApp,
      paper: neutrals.bgSurface,
    },
    divider: neutrals.borderDefault,
  },

  typography: {
    fontFamily: '"Plus Jakarta Sans", "Nunito", system-ui, -apple-system, sans-serif',
    h1: {
      fontSize: '1.75rem',    // 28px
      fontWeight: 900,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '1.375rem',   // 22px
      fontWeight: 800,
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.125rem',   // 18px
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1rem',       // 16px
      fontWeight: 700,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',       // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',   // 14px
      fontWeight: 400,
      lineHeight: 1.4,
    },
    caption: {
      fontSize: '0.75rem',    // 12px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',    // 12px
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: radii.md, // 12px default
  },

  spacing: 4, // base unit = 4px

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          minHeight: controls.buttonHeight.md,
          paddingInline: 20,
          transition: `background-color ${motion.fast} ${motion.easing.standard}`,
          '&:focus-visible': {
            outline: `2px solid ${brand.primary}`,
            outlineOffset: 2,
          },
        },
        sizeSmall: {
          minHeight: controls.buttonHeight.sm,
          paddingInline: 14,
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          minHeight: controls.buttonHeight.lg,
          paddingInline: 28,
          fontSize: '1rem',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radii.lg, // 16px
          backgroundImage: 'none',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radii.sm,
            minHeight: controls.inputHeight,
            transition: `border-color ${motion.fast} ${motion.easing.standard}`,
            '&:focus-within': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: brand.primary,
                borderWidth: 2,
              },
            },
          },
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: radii.md,
          backgroundImage: 'none', // remove MUI's gradient overlay
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radii.sm,
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },

    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          '& .Mui-selected': {
            color: brand.primary,
          },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: neutrals.borderSubtle,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },

    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontVariantNumeric: 'tabular-nums',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

/* ─── Re-export tokens for use outside MUI ──────────────── */
export const tokens = {
  brand,
  status,
  neutrals,
  radii,
  shadows,
  motion,
  controls,
} as const;
