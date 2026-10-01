import { supabase } from '../lib/supabase.js';
import { accessFor, emailHtml, editionSchema, NEWSLETTER_NAME } from './core.js';
import { checked, type Member, type Edition } from './store.js';
import { newsletterConfig, resend, httpError } from './providers.js';

type Contact = { id: string; email: string; unsubscribed: boolean };
export async function publishDue() {
  const c = newsletterConfig();
  if (!c.NEWSLETTER_FROM || !c.RESEND_NEWSLETTER_SEGMENT_ID) throw httpError(503, 'Configura remitente y segmento antes de publicar.');
  // One campaign at a time: a shared segment must not be changed during delivery.
  const active = checked(await supabase.from('newsletter_editions').select('id').in('status', ['sending', 'failed']).limit(1));
  if (active?.length) return { processed: 0, pendingReview: true };
  const due = checked(await supabase.from('newsletter_editions').select('*').eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(1)) as Edition[];
  const row = due[0];
  if (!row) return { processed: 0 };
  const claimed = checked(await supabase.rpc('newsletter_claim_publication', { p_id: row.id }));
  if (!claimed) return { processed: 0 };
  try {
    editionSchema.parse(row);
    if (!row.approved_at) throw httpError(409, 'La edición requiere aprobación.');
    const recipients: Member[] = [];
    for (let offset = 0; ; offset += 500) {
      const batch = checked(await supabase.from('newsletter_memberships').select('*').eq('email_enabled', true)
        .order('user_id').range(offset, offset + 499)) as Member[];
      recipients.push(...batch.filter(m => accessFor(m).hasAccess));
      if (batch.length < 500) break;
    }
    const segment = encodeURIComponent(c.RESEND_NEWSLETTER_SEGMENT_ID);
    // Remove former subscribers, including those expired since the last edition.
    const oldContacts: Contact[] = [];
    let cursor = '';
    do {
      const page = await resend<{ data: Contact[]; has_more: boolean }>(`segments/${segment}/contacts?limit=100${cursor ? `&after=${cursor}` : ''}`);
      oldContacts.push(...page.data);
      cursor = page.has_more ? page.data.at(-1)?.id ?? '' : '';
    } while (cursor);
    const wanted = new Set(recipients.map(m => m.email.toLowerCase()));
    for (const contact of oldContacts) {
      if (!wanted.has(contact.email.toLowerCase())) await resend(`contacts/${contact.id}/segments/${segment}`, 'DELETE');
    }
    let eligibleCount = 0;
    for (const recipient of recipients) {
      const email = encodeURIComponent(recipient.email);
      let contact: Contact;
      try { contact = await resend<Contact>(`contacts/${email}`); }
      catch (error) {
        if ((error as { status?: number }).status !== 404) throw error;
        const created = await resend<{ id: string }>('contacts', 'POST', { email: recipient.email });
        contact = { id: created.id, email: recipient.email, unsubscribed: false };
      }
      if (contact.unsubscribed) {
        checked(await supabase.from('newsletter_memberships').update({ email_enabled: false }).eq('user_id', recipient.user_id));
        continue; // Never re-subscribe a provider opt-out implicitly.
      }
      if (!oldContacts.some(old => old.id === contact.id)) await resend(`contacts/${contact.id}/segments/${segment}`, 'POST');
      eligibleCount += 1;
    }
    if (!eligibleCount) {
      checked(await supabase.from('newsletter_editions').update({ status: 'published', published_at: new Date().toISOString(), delivery_status: 'no_recipients' }).eq('id', row.id));
      return { processed: 1 };
    }
    const campaign = await resend<{ id: string }>('broadcasts', 'POST', {
      segment_id: c.RESEND_NEWSLETTER_SEGMENT_ID, from: c.NEWSLETTER_FROM,
      subject: `${NEWSLETTER_NAME}: ${row.title}`, name: `${NEWSLETTER_NAME} ${row.id}`, html: emailHtml(row),
    });
    checked(await supabase.from('newsletter_editions').update({ broadcast_id: campaign.id, delivery_status: 'sending' }).eq('id', row.id));
    await resend(`broadcasts/${campaign.id}/send`, 'POST', {});
    // Keep the global delivery lock until Resend confirms completion. A cron retry
    // inspects the existing campaign rather than sending another one.
    return { processed: 1, pendingDelivery: true };
  } catch {
    checked(await supabase.from('newsletter_editions').update({ status: 'failed', delivery_status: 'review_required',
      delivery_error: 'Revisa el envío en Resend antes de reintentar. No se reenviará automáticamente.' }).eq('id', row.id));
    throw httpError(502, 'La publicación requiere revisión. Consulta el panel editorial.');
  }
}

export async function reconcileDelivery() {
  const rows = checked(await supabase.from('newsletter_editions').select('*').in('status', ['sending', 'failed'])) as Edition[];
  for (const row of rows) {
    if (!row.broadcast_id) continue; // interrupted pre-send jobs require operator review
    const campaign = await resend<{ status: string }>(`broadcasts/${row.broadcast_id}`);
    if (campaign.status === 'sent') {
      checked(await supabase.from('newsletter_editions').update({ status: 'published', published_at: new Date().toISOString(), delivery_status: 'sent' }).eq('id', row.id));
    }
  }
}
