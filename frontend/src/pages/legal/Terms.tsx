import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.png';
import { gradientButtonSx } from '../auth/authStyles';

export default function Terms() {
  const nav = useNavigate();

  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        pt: `calc(12px + env(safe-area-inset-top))`,
        pb: `calc(24px + env(safe-area-inset-bottom))`,
      }}
    >
      {/* Header de marca */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 3, pb: 1.5, borderBottom: '1px solid #E5E7EB' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            component="img"
            src={logo}
            alt="FinEmpoder"
            sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
          />
          <Typography fontWeight={700}>FinEmpoder</Typography>
        </Stack>
        <Button variant="text" onClick={() => nav(-1)} sx={{ color: 'warning.dark', fontWeight: 600, textTransform: 'none' }}>
          Volver
        </Button>
      </Stack>

      {/* Contenido */}
      <Box sx={{ px: 3, pt: 3, flex: 1 }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          Términos y Condiciones
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
          Estos Términos y Condiciones regulan el uso de la aplicación <b>FinEmpoder</b>, propiedad del Instituto Tecnológico de Toluca.
          <br /><br />
          Al crear una cuenta o utilizar la aplicación, el usuario acepta cumplir con las siguientes disposiciones:
          <br /><br />
          <b>1. Uso responsable:</b> El usuario se compromete a proporcionar información veraz y a utilizar las herramientas de educación financiera con fines personales y educativos.
          <br /><br />
          <b>2. Protección de datos:</b> FinEmpoder no comparte datos personales con terceros sin autorización expresa del usuario.
          <br /><br />
          <b>3. Modificaciones:</b> La aplicación podrá actualizar sus funciones o políticas sin previo aviso, manteniendo siempre el acceso transparente a los usuarios.
          <br /><br />
          <b>4. Limitación de responsabilidad:</b> FinEmpoder no se responsabiliza por decisiones financieras tomadas con base en el contenido educativo de la aplicación.
          <br /><br />
          Al continuar utilizando FinEmpoder, el usuario acepta íntegramente estos términos.
        </Typography>
      </Box>

      <Box sx={{ px: 3, pt: 3 }}>
        <Button variant="contained" fullWidth onClick={() => nav(-1)} sx={gradientButtonSx}>
          Aceptar
        </Button>
      </Box>
    </Box>
  );
}
