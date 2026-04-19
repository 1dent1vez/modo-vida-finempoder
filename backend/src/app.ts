import express from 'express';
import { Sentry } from './lib/sentry.js';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { authRouter } from './routes/auth.js';
import { progressRouter } from './routes/progress.js';
import { questionnaireRouter } from './routes/questionnaire.js';
import { researchRouter } from './routes/research.js';
import { budgetRouter } from './routes/budget.js';

export const app = express();

// ── Security headers ───────────────────────────────────
app.use(helmet({
  // Strict-Transport-Security: fuerza HTTPS por 1 año en producción
  hsts: env.NODE_ENV === 'production'
    ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
    : false,

  // Esta es una API JSON pura — no sirve HTML, CSP no aplica
  contentSecurityPolicy: false,

  // Permite que el frontend (distinto origen) consuma la API
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // Resto de defaults de Helmet se mantienen:
  // X-Content-Type-Options: nosniff
  // X-Frame-Options: SAMEORIGIN
  // X-XSS-Protection (legacy browsers)
  // Referrer-Policy: no-referrer
}));

// ── CORS ───────────────────────────────────────────────
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
  credentials: false,
}));

// ── Body parsing ───────────────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ── HTTP request logging (pino-http) ───────────────────
if (env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

// ── Rate limiting ──────────────────────────────────────
// Global: 100 req/min por IP para todos los endpoints
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo en un minuto.' },
  skip: () => env.NODE_ENV === 'test',
});

// Auth: más estricto — 20 intentos/15min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, intenta de nuevo más tarde.' },
  skip: () => env.NODE_ENV === 'test',
});

app.use('/api', globalLimiter);

// ── Healthcheck ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'finempoder-api' });
});

// ── Rutas ──────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/progress', progressRouter);
app.use('/api/questionnaire', questionnaireRouter);
app.use('/api/research', researchRouter);
app.use('/api/budget', budgetRouter);

// ── 404 ───────────────────────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ── Error handler diferenciado ────────────────────────
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  Sentry.captureException(err);
  logger.error({ err }, '[api] unhandled error');

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'JSON malformado' });
  }

  const status = (err as any)?.status ?? (err as any)?.statusCode;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return res.status(status).json({ error: (err as any).message ?? 'Bad Request' });
  }

  return res.status(500).json({ error: 'Internal Server Error' });
});
