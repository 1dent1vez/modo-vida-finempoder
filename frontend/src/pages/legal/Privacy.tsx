import { Box, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.png';
import { gradientButtonSx } from '../auth/authStyles';

export default function Privacy() {
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
          Política de Privacidad
        </Typography>

        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
          La aplicación <b>FinEmpoder</b> respeta la privacidad de sus usuarios y protege los datos personales conforme a la legislación mexicana vigente.
          <br /><br />
          <b>1. Recolección de datos:</b> Se recopilan únicamente los datos necesarios para crear la cuenta del usuario (nombre, correo, carrera, edad y número telefónico).
          <br /><br />
          <b>2. Uso de la información:</b> Los datos se emplean para personalizar la experiencia educativa y mejorar los contenidos financieros.
          <br /><br />
          <b>3. Seguridad:</b> Los datos se almacenan de manera cifrada en servidores seguros.
          <br /><br />
          <b>4. Derechos del usuario:</b> El usuario puede solicitar en cualquier momento la eliminación o modificación de sus datos.
          <br /><br />
          <b>5. Contacto:</b> Para ejercer estos derechos o resolver dudas, puede escribir a <b>soporte@finempoder.mx</b>.
          <br /><br />
          Al continuar utilizando FinEmpoder, el usuario reconoce haber leído y comprendido esta política de privacidad.
        </Typography>
      </Box>

      <Box sx={{ px: 3, pt: 3 }}>
        <Button variant="contained" fullWidth onClick={() => nav(-1)} sx={gradientButtonSx}>
          Entendido
        </Button>
      </Box>
    </Box>
  );
}
