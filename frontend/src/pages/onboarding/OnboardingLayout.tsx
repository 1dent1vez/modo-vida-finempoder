import { Box, Button, Stack, Typography } from '@mui/material';
import logo from '../../assets/Logo.png';

type Props = {
  img: string;
  title: string;
  body: string;
  step: 1 | 2 | 3;
  primaryLabel: string;
  onPrimary: () => void;
  onSkip?: () => void;
};

export default function OnboardingLayout({
  img, title, body, step, primaryLabel, onPrimary, onSkip,
}: Props) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        minHeight: '100svh',          // pantalla completa (incluye barras móviles)
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr auto auto',
        px: 3,
        pt: `calc(12px + env(safe-area-inset-top))`,
        pb: `calc(12px + env(safe-area-inset-bottom))`,
      }}
    >
      {/* Header: logo + nombre de marca */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          component="img"
          src={logo}
          alt="FinEmpoder"
          sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
        />
        <Typography fontWeight={700}>FinEmpoder</Typography>
      </Stack>

      {/* Ilustración */}
      <Box sx={{ display: 'grid', placeItems: 'center', mt: 1 }}>
        <Box
          component="img"
          src={img}
          alt=""
          // proporción visual de mockup: grande pero con resguardo lateral
          sx={{ width: '78vw', maxWidth: 360, height: 'auto' }}
        />
      </Box>

      {/* Texto */}
      <Stack spacing={1.25} sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: 'warning.dark' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </Stack>

      {/* Indicadores */}
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ my: 2 }}>
        <Dot active={step === 1} />
        <Dot active={step === 2} />
        <Dot active={step === 3} />
      </Stack>

      {/* Acciones fijadas al borde inferior con safe-area */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 2 }}>
        <Button
          variant="text"
          disableRipple
          onClick={onSkip}
          sx={{
            color: 'secondary.main',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: .5,
          }}
        >
          {onSkip ? 'Saltar' : ' '}
        </Button>

        <Button
          variant="contained"
          onClick={onPrimary}
          sx={{
            flexShrink: 0,
            px: 3.5,
            py: 1.4,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: '0 12px 28px rgba(243,156,18,.35)',
            background: 'linear-gradient(180deg,#F5B041 0%, #F39C12 100%)',
            '&:hover': { background: 'linear-gradient(180deg,#F0A030 0%, #E08E0E 100%)' },
          }}
        >
          {primaryLabel}
        </Button>
      </Stack>
    </Box>
  );
}

function Dot({ active = false }: { active?: boolean }) {
  return (
    <Box
      sx={{
        width: 8, height: 8, borderRadius: '50%',
        bgcolor: active ? 'warning.dark' : 'rgba(0,0,0,.25)',
      }}
    />
  );
}
