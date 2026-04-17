import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN;

/**
 * Inicializa Sentry si SENTRY_DSN está definida.
 * Sin DSN es un no-op completo — no afecta el comportamiento en dev/test.
 */
export function initSentry() {
  if (!dsn || process.env.NODE_ENV === 'test') return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.2,
  });
}

export { Sentry };
