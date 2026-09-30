import { z } from 'zod';

const configSchema = z.object({
  NEWSLETTER_ENABLED: z.enum(['true', 'false']).default('false'),
  NEWSLETTER_PAYMENTS_ENABLED: z.enum(['true', 'false']).default('false'),
  NEWSLETTER_APP_URL: z.string().url().optional(),
  NEWSLETTER_ADMIN_IDS: z.string().default(''),
  NEWSLETTER_TERMS_VERSION: z.string().default(''),
  NEWSLETTER_FROM: z.string().default(''),
  NEWSLETTER_SUPPORT_EMAIL: z.string().default(''),
  NEWSLETTER_CRON_SECRET: z.string().default(''),
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  STRIPE_NEWSLETTER_PRICE_ID: z.string().default(''),
  RESEND_API_KEY: z.string().default(''),
  RESEND_NEWSLETTER_SEGMENT_ID: z.string().default(''),
  OPENAI_API_KEY: z.string().default(''),
  NEWSLETTER_AI_MODEL: z.string().default('gpt-5'),
});
export const newsletterConfig = () => configSchema.parse(process.env);
export function httpError(status: number, message: string) { return Object.assign(new Error(message), { status }); }
export const isEditor = (id: string) => newsletterConfig().NEWSLETTER_ADMIN_IDS.split(',').map(s => s.trim()).includes(id);
export function paymentsReady() {
  const c = newsletterConfig();
  return c.NEWSLETTER_PAYMENTS_ENABLED === 'true' && !!(c.STRIPE_SECRET_KEY && c.STRIPE_WEBHOOK_SECRET
    && c.STRIPE_NEWSLETTER_PRICE_ID && c.NEWSLETTER_APP_URL && c.NEWSLETTER_TERMS_VERSION && c.NEWSLETTER_SUPPORT_EMAIL);
}
export function appUrl(path: string) {
  const base = newsletterConfig().NEWSLETTER_APP_URL;
  if (!base) throw httpError(503, 'La suscripción todavía no está disponible.');
  return new URL(path, base).toString();
}

export async function stripe<T>(path: string, fields?: Record<string, string>, key?: string): Promise<T> {
  const c = newsletterConfig();
  if (!c.STRIPE_SECRET_KEY) throw httpError(503, 'Los pagos todavía no están disponibles.');
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: fields ? 'POST' : 'GET', signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${c.STRIPE_SECRET_KEY}`, 'Stripe-Version': '2025-02-24.acacia',
      ...(fields ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(key ? { 'Idempotency-Key': key } : {}) },
    ...(fields ? { body: new URLSearchParams(fields).toString() } : {}),
  });
  if (!response.ok) throw httpError(502, 'El proveedor de pagos no respondió correctamente. Inténtalo de nuevo.');
  return response.json() as Promise<T>;
}

export async function resend<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const c = newsletterConfig();
  if (!c.RESEND_API_KEY) throw httpError(503, 'El envío de correo aún no está configurado.');
  // Stay within the provider's default request rate, including list synchronization.
  await new Promise(resolve => setTimeout(resolve, 550));
  const response = await fetch(`https://api.resend.com/${path}`, {
    method, signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${c.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw httpError(response.status === 404 ? 404 : 502, 'No se pudo completar la operación de correo.');
  return response.json() as Promise<T>;
}

export type StripeSubscription = {
  id: string; customer: string; status: string; cancel_at_period_end: boolean;
  metadata: { user_id?: string }; current_period_end: number;
  items: { data: { price: { id: string } }[] };
  latest_invoice: { paid: boolean; status: string; amount_paid: number; period_end: number;
    lines: { data: { price: { id: string } | null; proration: boolean; period: { end: number } }[] } } | null;
};
