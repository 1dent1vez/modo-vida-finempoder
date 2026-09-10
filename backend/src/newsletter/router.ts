import express from 'express';
import type { Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { authGuard } from '../middlewares/auth.js';
import { supabase } from '../lib/supabase.js';
import { PRICE_CENTS, accessFor, editionSchema, emailHtml, verifyStripeSignature } from './core.js';
import { checked, edition, member, META } from './store.js';
import { stripe, newsletterConfig, paymentsReady, isEditor, httpError, appUrl, resend } from './providers.js';
import { publishDue, reconcileDelivery } from './delivery.js';
import { syncSubscription, reconcileBilling } from './billing.js';

export const newsletterRouter = express.Router();
newsletterRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store');
  if (newsletterConfig().NEWSLETTER_ENABLED !== 'true') return res.status(503).json({ error: 'El newsletter está en preparación.' });
  next();
});
newsletterRouter.get('/catalog', async (_req, res) => {
  const editions = checked(await supabase.from('newsletter_editions').select(META).eq('status', 'published').order('published_at', { ascending: false }).limit(300));
  res.json({ editions, price: PRICE_CENTS / 100, paymentsReady: paymentsReady(), supportEmail: newsletterConfig().NEWSLETTER_SUPPORT_EMAIL });
});
newsletterRouter.get('/sample/:id', async (req, res) => {
  const id = z.uuid().parse(req.params.id);
  const row = await edition(id);
  if (row.status !== 'published' || !row.is_sample) throw httpError(404, 'No encontramos esta muestra.');
  res.json(row);
});

newsletterRouter.post('/jobs/publish', async (req, res) => {
  const secret = newsletterConfig().NEWSLETTER_CRON_SECRET;
  const provided = req.header('Authorization')?.replace(/^Bearer /, '') ?? '';
  if (secret.length < 32 || Buffer.byteLength(secret) !== Buffer.byteLength(provided)
    || !timingSafeEqual(Buffer.from(secret), Buffer.from(provided))) throw httpError(403, 'No autorizado.');
  await reconcileBilling();
  await reconcileDelivery();
  res.json(await publishDue());
});

newsletterRouter.use(authGuard);
newsletterRouter.get('/me', async (req, res) => {
  const row = await member(req.user!.sub);
  res.json({ ...accessFor(row), status: row?.status ?? 'none', cancelAtPeriodEnd: row?.cancel_at_period_end ?? false,
    emailEnabled: row?.email_enabled ?? false, canManage: !!row?.stripe_subscription_id,
    canSubscribe: !row?.stripe_subscription_id || ['canceled', 'incomplete_expired'].includes(row.status),
    isEditor: isEditor(req.user!.sub) });
});
newsletterRouter.get('/editions/:id', async (req, res) => {
  const row = await edition(z.uuid().parse(req.params.id));
  if (row.status !== 'published') throw httpError(404, 'No encontramos esta edición.');
  if (!row.is_sample && !accessFor(await member(req.user!.sub)).hasAccess) throw httpError(403, 'Necesitas una suscripción vigente para leer esta edición.');
  res.json(row);
});
newsletterRouter.patch('/preferences', async (req, res) => {
  const { emailEnabled } = z.object({ emailEnabled: z.boolean() }).parse(req.body);
  const row = await member(req.user!.sub);
  if (!row) throw httpError(409, 'Todavía no tienes una suscripción.');
  // A deliberate toggle may re-enable delivery; billing changes never do.
  if (newsletterConfig().RESEND_API_KEY) {
    try { await resend(`contacts/${encodeURIComponent(row.email)}`, 'PATCH', { unsubscribed: !emailEnabled }); }
    catch (error) { if ((error as { status?: number }).status !== 404) throw error; }
  }
  checked(await supabase.from('newsletter_memberships').update({ email_enabled: emailEnabled }).eq('user_id', req.user!.sub));
  res.json({ ok: true });
});

newsletterRouter.post('/checkout', async (req, res) => {
  if (!paymentsReady()) throw httpError(503, 'La contratación todavía no está disponible.');
  const consent = z.object({ adult: z.literal(true), acceptsTerms: z.literal(true), emailEnabled: z.boolean() }).parse(req.body);
  const id = req.user!.sub;
  const c = newsletterConfig();
  const price = await stripe<{ currency: string; unit_amount: number; recurring: { interval: string; interval_count: number }; active: boolean }>(`prices/${encodeURIComponent(c.STRIPE_NEWSLETTER_PRICE_ID)}`);
  if (!price.active || price.currency !== 'mxn' || price.unit_amount !== PRICE_CENTS || price.recurring?.interval !== 'month' || price.recurring.interval_count !== 1) throw httpError(503, 'La tarifa necesita revisión antes de habilitar el cobro.');
  let row = await member(id);
  if (!row) {
    checked(await supabase.from('newsletter_memberships').upsert({ user_id: id, email: req.user!.email }, { onConflict: 'user_id', ignoreDuplicates: true }));
    row = await member(id);
  }
  let customer = row?.stripe_customer_id;
  if (!customer) {
    customer = (await stripe<{ id: string }>('customers', { email: req.user!.email, 'metadata[user_id]': id }, `newsletter-customer-${id}`)).id;
    checked(await supabase.from('newsletter_memberships').update({ stripe_customer_id: customer }).eq('user_id', id));
  }
  const subscriptions = await stripe<{ data: { status: string }[] }>(`subscriptions?customer=${encodeURIComponent(customer)}&status=all&limit=100`);
  if (subscriptions.data.some(s => !['canceled', 'incomplete_expired'].includes(s.status))) throw httpError(409, 'Ya tienes una suscripción. Adminístrala desde tu cuenta.');
  const claims = checked(await supabase.rpc('newsletter_checkout_claim', { p_user: id })) as { request_key: string; expires_at: string }[];
  const claim = claims[0];
  if (!claim) throw httpError(503, 'No se pudo iniciar el pago.');
  checked(await supabase.from('newsletter_memberships').update({ accepted_at: new Date().toISOString(),
    terms_version: c.NEWSLETTER_TERMS_VERSION, email_enabled: consent.emailEnabled }).eq('user_id', id));
  const checkout = await stripe<{ id: string; url: string }>('checkout/sessions', {
    mode: 'subscription', customer, 'line_items[0][price]': c.STRIPE_NEWSLETTER_PRICE_ID,
    'line_items[0][quantity]': '1', 'payment_method_types[0]': 'card', locale: 'es',
    client_reference_id: id, 'subscription_data[metadata][user_id]': id,
    success_url: appUrl('/app/newsletter?payment=processing'), cancel_url: appUrl('/app/newsletter?payment=cancelled'),
    expires_at: String(Math.floor(Date.parse(claim.expires_at) / 1000)),
  }, `newsletter-checkout-${claim.request_key}`);
  checked(await supabase.from('newsletter_memberships').update({ checkout_id: checkout.id }).eq('user_id', id));
  res.json({ url: checkout.url });
});
newsletterRouter.post('/portal', async (req, res) => {
  const row = await member(req.user!.sub);
  if (!row?.stripe_customer_id) throw httpError(409, 'No hay una cuenta de cobro para administrar.');
  const session = await stripe<{ url: string }>('billing_portal/sessions', { customer: row.stripe_customer_id, return_url: appUrl('/app/newsletter') });
  res.json(session);
});
newsletterRouter.post('/cancel', async (req, res) => {
  const row = await member(req.user!.sub);
  if (!row?.stripe_subscription_id) throw httpError(409, 'No tienes una suscripción que cancelar.');
  await stripe(`subscriptions/${encodeURIComponent(row.stripe_subscription_id)}`, { cancel_at_period_end: 'true' });
  checked(await supabase.from('newsletter_memberships').update({ cancel_at_period_end: true }).eq('user_id', req.user!.sub));
  res.json({ ok: true });
});

newsletterRouter.use('/admin', (req, _res, next) => {
  if (!isEditor(req.user!.sub)) throw httpError(403, 'Solo el responsable editorial puede acceder.');
  next();
});
newsletterRouter.get('/admin/editions', async (_req, res) => {
  res.json(checked(await supabase.from('newsletter_editions').select('*').order('created_at', { ascending: false }).limit(100)));
});
newsletterRouter.get('/admin/members', async (_req, res) => {
  res.json(checked(await supabase.from('newsletter_memberships').select('user_id,email,status,paid_until,pilot_until,email_enabled,cancel_at_period_end').order('updated_at', { ascending: false }).limit(500)));
});
newsletterRouter.post('/admin/pilot', async (req, res) => {
  const input = z.object({ userId: z.uuid(), until: z.iso.datetime(), emailConsent: z.boolean() }).parse(req.body);
  const until = Date.parse(input.until);
  if (until <= Date.now() || until > Date.now() + 32 * 86400000) throw httpError(400, 'El piloto debe terminar dentro de los próximos 32 días.');
  const lookup = await supabase.auth.admin.getUserById(input.userId);
  if (lookup.error) throw httpError(404, 'No encontramos la cuenta.');
  const user = lookup.data.user;
  if (!user?.email) throw httpError(404, 'No encontramos una cuenta con correo.');
  const existing = await member(input.userId);
  if (existing?.pilot_until) throw httpError(409, 'Esta cuenta ya recibió acceso al piloto.');
  // Existing paid access and existing opt-out are preserved.
  checked(await supabase.from('newsletter_memberships').upsert({ user_id: input.userId, email: user.email,
    pilot_until: input.until, email_enabled: existing?.email_enabled ?? input.emailConsent }, { onConflict: 'user_id' }));
  res.json({ ok: true });
});
newsletterRouter.post('/admin/editions', async (req, res) => {
  const data = editionSchema.parse(req.body);
  res.status(201).json(checked(await supabase.from('newsletter_editions').insert(data).select('*').single()));
});
newsletterRouter.put('/admin/editions/:id', async (req, res) => {
  const row = await edition(z.uuid().parse(req.params.id));
  const data = editionSchema.parse(req.body);
  const expectedVersion = z.number().int().positive().parse(req.body.version);
  const result = checked(await supabase.from('newsletter_editions').update({ ...data, status: 'draft', version: expectedVersion + 1,
    approved_at: null, approved_by: null, scheduled_at: null, updated_at: new Date().toISOString() })
    .eq('id', row.id).eq('version', expectedVersion).in('status', ['draft', 'approved', 'scheduled']).select('*').maybeSingle());
  if (!result) throw httpError(409, 'La edición cambió o ya se está publicando. Recarga antes de editar.');
  res.json(result);
});
newsletterRouter.post('/admin/editions/:id/approve', async (req, res) => {
  const row = await edition(z.uuid().parse(req.params.id));
  const { reviewed, version } = z.object({ reviewed: z.literal(true), version: z.number().int() }).parse(req.body);
  if (!reviewed) throw httpError(400, 'Confirma la revisión editorial.');
  editionSchema.parse(row);
  const updated = checked(await supabase.from('newsletter_editions').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: req.user!.sub })
    .eq('id', row.id).eq('version', version).eq('status', 'draft').select('id').maybeSingle());
  if (!updated) throw httpError(409, 'Guarda y vuelve a revisar la versión actual.');
  res.json({ ok: true });
});
newsletterRouter.post('/admin/editions/:id/schedule', async (req, res) => {
  const { at, version } = z.object({ at: z.iso.datetime(), version: z.number().int() }).parse(req.body);
  if (Date.parse(at) < Date.now()) throw httpError(400, 'Elige una fecha futura.');
  const updated = checked(await supabase.from('newsletter_editions').update({ status: 'scheduled', scheduled_at: at })
    .eq('id', z.uuid().parse(req.params.id)).eq('version', version).eq('status', 'approved').select('id').maybeSingle());
  if (!updated) throw httpError(409, 'Aprueba la versión actual antes de programar.');
  res.json({ ok: true });
});
newsletterRouter.post('/admin/editions/:id/test', async (req, res) => {
  const row = await edition(z.uuid().parse(req.params.id));
  if (!newsletterConfig().NEWSLETTER_FROM) throw httpError(503, 'Configura el remitente.');
  const html = emailHtml(editionSchema.parse(row)).replaceAll('{{{RESEND_UNSUBSCRIBE_URL}}}', appUrl('/app/newsletter'));
  await resend('emails', 'POST', { from: newsletterConfig().NEWSLETTER_FROM, to: [req.user!.email], subject: `[PRUEBA] ${row.title}`, html });
  res.json({ ok: true });
});
newsletterRouter.get('/admin/editions/:id/preview', async (req, res) => {
  const row = await edition(z.uuid().parse(req.params.id));
  res.json({ html: emailHtml(editionSchema.parse(row)).replaceAll('{{{RESEND_UNSUBSCRIBE_URL}}}', '#') });
});
newsletterRouter.post('/admin/reconcile-delivery', async (_req, res) => { await reconcileDelivery(); res.json({ ok: true }); });

export async function stripeWebhook(req: Request, res: Response) {
  const c = newsletterConfig();
  if (!c.STRIPE_WEBHOOK_SECRET || !Buffer.isBuffer(req.body)
    || !verifyStripeSignature(req.body, req.header('stripe-signature') ?? '', c.STRIPE_WEBHOOK_SECRET)) return res.status(400).json({ error: 'Firma inválida' });
  const event = JSON.parse(req.body.toString()) as { id: string; created: number; type: string; data: { object: { id: string; subscription?: string } } };
  const relevant = ['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.paid', 'invoice.payment_failed', 'checkout.session.completed'];
  if (!relevant.includes(event.type)) return res.json({ received: true });
  const subId = event.type.startsWith('customer.subscription.') ? event.data.object.id : event.data.object.subscription;
  if (!subId) return res.json({ received: true });
  await syncSubscription(subId, event.id, event.created);
  return res.json({ received: true });
}
