import { useEffect, useState } from 'react';
import { Alert, CircularProgress, Box } from '@mui/material';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { SyncManager, type SyncStatus } from '@/lib/sync/SyncManager';

interface OfflineBannerProps {
  dense?: boolean;
}

export default function OfflineBanner({ dense = false }: OfflineBannerProps) {
  const online = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncManager.getStatus());

  useEffect(() => SyncManager.subscribe(setSyncStatus), []);

  const visible = !online || syncStatus === 'syncing' || syncStatus === 'synced' || syncStatus === 'error';
  if (!visible) return null;

  const sx = {
    borderRadius: 0,
    py: dense ? 0.5 : 1,
    px: 2,
    fontSize: dense ? '0.8rem' : '0.9rem',
  } as const;

  if (!online) {
    return (
      <Alert severity="warning" variant="filled" sx={sx}>
        Sin conexión — tu progreso se guardará cuando vuelvas a conectarte.
      </Alert>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <Alert
        severity="info"
        variant="filled"
        sx={sx}
        icon={<Box display="flex" alignItems="center"><CircularProgress size={16} color="inherit" /></Box>}
      >
        Sincronizando progreso...
      </Alert>
    );
  }

  if (syncStatus === 'synced') {
    return (
      <Alert severity="success" variant="filled" sx={sx}>
        ✓ Progreso sincronizado
      </Alert>
    );
  }

  if (syncStatus === 'error') {
    return (
      <Alert severity="error" variant="filled" sx={sx}>
        No se pudo sincronizar el progreso. Se reintentará automáticamente.
      </Alert>
    );
  }

  return null;
}
