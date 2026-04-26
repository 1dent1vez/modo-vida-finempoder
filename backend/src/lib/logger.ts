import pino from 'pino';
import type { LoggerOptions } from 'pino';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? (isTest ? 'silent' : 'info'),

  // Railway (y GCP/Datadog) esperan "message" en lugar del "msg" por defecto de pino.
  // Sin esto los logs aparecen con "message": "" en el panel de Railway.
  messageKey: 'message',

  // Campos base que aparecen en todos los logs de producción
  base: isDev ? null : { service: 'finempoder-api' },
};

if (isDev) {
  options.transport = {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
  };
}

export const logger = pino(options);
