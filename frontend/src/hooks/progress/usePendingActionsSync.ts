import { useEffect, useRef } from 'react';
import client from '../../api/client';
import { pendingActionsRepository } from '../../db/pendingActions.repository';
import { useAuth } from '../../store/auth';
import { db } from '../../db/finempoderDb';
import { useNotifications } from '../../store/notifications';
import { isStale, canRetryNow, MAX_RETRIES } from './pendingActions.utils';

export function usePendingActionsSync() {
  const userId = useAuth((s) => s.user?.id);
  const token = useAuth((s) => s.token);
  const isProcessing = useRef(false);
  const notify = useNotifications((s) => s.enqueue);

  useEffect(() => {
    if (!userId || !token) return;
    let cancelled = false;

    const processQueue = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;
      try {
        const actions = await pendingActionsRepository.listByUser(userId);
        for (const action of actions) {
          if (cancelled) return;

          if (isStale(action)) {
            if (action.id) await pendingActionsRepository.remove(action.id);
            notify('Sincronización descartada por ser muy antigua.', 'warning');
            continue;
          }
          if ((action.retryCount ?? 0) >= MAX_RETRIES) {
            if (action.id) await pendingActionsRepository.remove(action.id);
            notify('No se pudo sincronizar un progreso tras varios intentos.', 'error');
            continue;
          }
          if (!canRetryNow(action)) continue;

          if (pendingActionsRepository.isLessonCompletedAction(action)) {
            try {
              if (action.id) {
                await db.pendingActions.update(action.id, { lastTriedAt: new Date().toISOString() });
              }
              await client.post(action.resource, action.payload);
              if (action.id) await pendingActionsRepository.remove(action.id);
            } catch (err) {
              // backoff lineal: incrementa retryCount y marca lastTriedAt
              if (action.id) {
                await db.pendingActions.update(action.id, {
                  retryCount: (action.retryCount ?? 0) + 1,
                  lastTriedAt: new Date().toISOString(),
                });
              }
              console.warn('[pendingActions] reintento fallido, se deja en cola', err);
              notify('No se pudo sincronizar progreso. Se reintentará.', 'warning');
            }
          } else {
            if (action.id) await pendingActionsRepository.remove(action.id);
          }
        }
      } finally {
        isProcessing.current = false;
      }
    };

    void processQueue();

    const onOnline = () => {
      if (!cancelled) void processQueue();
    };
    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      window.removeEventListener('online', onOnline);
    };
  }, [userId, token, notify]);
}
