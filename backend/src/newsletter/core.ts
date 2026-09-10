import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const PRICE_CENTS = 4900;
export const GRACE_MS = 3 * 24 * 60 * 60 * 1000;
export type Membership = {
  status: string; paid_until: string | null; pilot_until: string | null;
  cancel_at_period_end: boolean; stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
};
export function accessFor(row: Membership | null, now = Date.now()) {
  const paid = Date.parse(row?.paid_until ?? '') || 0;
  const pilot = Date.parse(row?.pilot_until ?? '') || 0;
  const grace = row?.status === 'past_due' && paid > 0 ? paid + GRACE_MS : 0;
  const until = Math.max(paid, pilot, grace);
  return { hasAccess: until > now, accessUntil: until ? new Date(until).toISOString() : null,
    isPilot: pilot > now && pilot > paid, inGrace: grace > now && paid <= now };
}

export function verifyStripeSignature(raw: Buffer, header: string, secret: string, now = Date.now()) {
  const pieces = header.split(',').map(part => part.split('='));
  const stamp = pieces.find(([key]) => key === 't')?.[1];
  if (!stamp || !/^\d+$/.test(stamp) || Math.abs(now / 1000 - Number(stamp)) > 300) return false;
  const expected = createHmac('sha256', secret).update(`${stamp}.`).update(raw).digest();
  return pieces.some(([key, value]) => key === 'v1' && !!value && /^[a-f0-9]{64}$/i.test(value)
    && timingSafeEqual(Buffer.from(value, 'hex'), expected));
}

export const editionSchema = z.object({
  title: z.string().trim().min(5).max(140),
  summary: z.string().trim().min(20).max(600),
  category: z.enum(['Antes de contratar', 'Fugas de dinero', 'La letra chiquita']),
  body: z.string().trim().min(100).max(40000),
  sources: z.array(z.object({ title: z.string().trim().min(2).max(150),
    url: z.string().url().refine(value => value.startsWith('https://'), 'Usa una fuente HTTPS') })).min(1).max(20),
  author: z.string().trim().min(3).max(120),
  is_sample: z.boolean(),
});
export type EditionInput = z.infer<typeof editionSchema>;
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export function emailHtml(edition: EditionInput) {
  const body = edition.body.split(/\n\s*\n/).map(p => `<p style="margin:0 0 20px;white-space:pre-line">${escapeHtml(p)}</p>`).join('');
  return `<!doctype html><html lang="es-MX"><meta charset="utf-8"><body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif"><main style="max-width:640px;margin:auto;padding:32px 24px;background:white"><p style="color:#1b4fd8;font-weight:bold">Finempoder</p><h1>${escapeHtml(edition.title)}</h1><p>${escapeHtml(edition.summary)}</p><p>Por ${escapeHtml(edition.author)}</p><div style="font-size:17px;line-height:1.7">${body}</div><h2>Fuentes</h2><ul>${edition.sources.map(s => `<li><a href="${escapeHtml(s.url)}">${escapeHtml(s.title)}</a></li>`).join('')}</ul><p>Contenido educativo. Tres ediciones al mes.</p><p><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Dejar de recibir el newsletter por correo</a>. Esto no cancela tu suscripción de pago; puedes administrarla desde la app.</p></main></body></html>`;
}
