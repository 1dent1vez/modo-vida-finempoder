import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/shared/components/Spinner';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { SyncManager, type SyncStatus } from '@/lib/sync/SyncManager';

interface OfflineBannerProps {
  dense?: boolean;
}

const baseClass = 'w-full flex items-center gap-2 px-4 font-medium text-white';

export default function OfflineBanner({ dense = false }: OfflineBannerProps) {
  const online = useOnlineStatus();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncManager.getStatus());

  useEffect(() => SyncManager.subscribe(setSyncStatus), []);

  const py = dense ? 'py-1.5 text-xs' : 'py-2.5 text-sm';

  if (!online) {
    return (
      <div role="alert" className={cn(baseClass, py, 'bg-[var(--color-brand-warning)]')}>
        Sin conexión — tu progreso se guardará cuando vuelvas a conectarte.
      </div>
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <div role="status" className={cn(baseClass, py, 'bg-[var(--color-brand-info)]')}>
        <Spinner size="sm" className="border-white/40 border-t-white" />
        Sincronizando progreso...
      </div>
    );
  }

  if (syncStatus === 'synced') {
    return (
      <div role="status" className={cn(baseClass, py, 'bg-[var(--color-brand-success)]')}>
        ✓ Progreso sincronizado
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div role="alert" className={cn(baseClass, py, 'bg-[var(--color-brand-error)]')}>
        No se pudo sincronizar el progreso. Se reintentará automáticamente.
      </div>
    );
  }

  return null;
}
