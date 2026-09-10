import { randomUUID } from 'node:crypto';
import { supabase } from '../lib/supabase.js';
import { checked, member, type Member } from './store.js';
import { stripe, newsletterConfig, httpError, type StripeSubscription } from './providers.js';
import { PRICE_CENTS } from './core.js';

export function paidThrough(sub: StripeSubscription, priceId: string): string | null {
  const invoice = sub.latest_invoice;
  if (!invoice?.paid || invoice.amount_paid < PRICE_CENTS) return null;
  const ends = invoice.lines.data.filter(line => line.price?.id === priceId && !line.proration)
    .map(line => line.period.end).filter(Number.isFinite);
  const end = Math.max(0, ...ends);
  return end ? new Date(end * 1000).toISOString() : null;
}
export async function syncSubscription(subId: string, eventId = `reconcile-${randomUUID()}`, created = Math.floor(Date.now() / 1000)) {
  const sub = await stripe<StripeSubscription>(`subscriptions/${encodeURIComponent(subId)}?expand[]=latest_invoice`);
  const price = newsletterConfig().STRIPE_NEWSLETTER_PRICE_ID;
  if (!sub.items.data.some(item => item.price.id === price)) return;
  const id = sub.metadata.user_id;
  if (!id) throw httpError(400, 'Suscripción sin usuario válido.');
  const row = await member(id);
  if (!row || row.stripe_customer_id !== sub.customer) throw httpError(400, 'Cuenta de cobro no vinculada.');
  checked(await supabase.rpc('newsletter_apply_event', { p_event_id: eventId, p_created: created,
    p_user: id, p_subscription: sub.id, p_status: sub.status, p_paid_until: paidThrough(sub, price), p_cancel: sub.cancel_at_period_end }));
}
export async function reconcileBilling() {
  if (!newsletterConfig().STRIPE_SECRET_KEY) return;
  for (let offset = 0; ; offset += 100) {
    const rows = checked(await supabase.from('newsletter_memberships').select('*').not('stripe_subscription_id', 'is', null)
      .order('user_id').range(offset, offset + 99)) as Member[];
    for (const row of rows) if (row.stripe_subscription_id) await syncSubscription(row.stripe_subscription_id);
    if (rows.length < 100) break;
  }
}
