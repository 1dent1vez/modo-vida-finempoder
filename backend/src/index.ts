// Sentry debe inicializarse antes de importar cualquier otro módulo
import { initSentry, Sentry } from './lib/sentry.js';
initSentry();

import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`[api] running on http://localhost:${env.PORT}`);
});

// ── Graceful shutdown ──────────────────────────────────
function shutdown(signal: string) {
  logger.info(`[api] ${signal} recibido — cerrando servidor`);
  server.close(() => {
    logger.info('[api] conexiones cerradas — saliendo');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Errores no capturados ──────────────────────────────
process.on('unhandledRejection', (reason) => {
  Sentry.captureException(reason);
  logger.error({ reason }, '[api] unhandledRejection');
});

process.on('uncaughtException', (err) => {
  Sentry.captureException(err);
  logger.fatal({ err }, '[api] uncaughtException');
  process.exit(1);
});
