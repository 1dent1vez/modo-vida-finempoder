import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

/**
 * Inicializa Sentry si VITE_SENTRY_DSN está definida.
 * Sin DSN es un no-op completo — no afecta el comportamiento en dev.
 */
export function initSentry() {
  if (!dsn || import.meta.env.DEV) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.2,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

export { Sentry };
