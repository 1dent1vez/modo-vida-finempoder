import { Alert, AlertTitle } from '@mui/material';
import React from 'react';

interface OfflineBannerProps {
  dense?: boolean;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ dense = false }) => {
  return (
    <Alert
      severity="warning"
      variant="filled"
      sx={{
        borderRadius: 0,
        py: dense ? 0.5 : 1,
        px: 2,
        fontSize: dense ? '0.8rem' : '0.9rem'
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, fontSize: dense ? '0.9rem' : '1rem' }}>
        Sin conexión
      </AlertTitle>
      Puedes seguir usando FinEmpoder; algunos datos se sincronizarán cuando vuelvas a estar en línea.
    </Alert>
  );
};

export default OfflineBanner;
