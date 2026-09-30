import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { accessFor, GRACE_MS, verifyStripeSignature, editionSchema, emailHtml } from '../src/newsletter/core.js';

const now = Date.parse('2026-09-05T12:00:00Z');
const base = { status: 'none', paid_until: null, pilot_until: null, cancel_at_period_end: false };
test('guests, unpaid first invoices and expired memberships do not unlock paid content', () => {
  assert.equal(accessFor(null, now).hasAccess, false);
  assert.equal(accessFor({ ...base, status: 'past_due' }, now).hasAccess, false);
  assert.equal(accessFor({ ...base, status: 'active', paid_until: new Date(now).toISOString() }, now).hasAccess, false);
});
test('canceling preserves already paid time, with no extension', () => {
  const row = { ...base, status: 'canceled', paid_until: new Date(now + 1000).toISOString(), cancel_at_period_end: true };
  assert.equal(accessFor(row, now).hasAccess, true);
  assert.equal(accessFor(row, now + 1000).hasAccess, false);
});
test('renewal grace ends exactly three days after the paid period', () => {
  const row = { ...base, status: 'past_due', paid_until: new Date(now).toISOString() };
  assert.equal(accessFor(row, now + GRACE_MS - 1).inGrace, true);
  assert.equal(accessFor(row, now + GRACE_MS).hasAccess, false);
});
test('pilot access ends without becoming a paid membership', () => {
  const row = { ...base, pilot_until: new Date(now + 1000).toISOString() };
  assert.equal(accessFor(row, now).isPilot, true);
  assert.equal(accessFor(row, now + 1000).hasAccess, false);
  assert.equal(row.status, 'none');
});
test('Stripe signature authenticates raw bytes, supports rotation, rejects tampering and replay', () => {
  const raw = Buffer.from('{"id":"evt_test"}');
  const stamp = now / 1000;
  const signature = createHmac('sha256', 'test-secret').update(`${stamp}.`).update(raw).digest('hex');
  assert.equal(verifyStripeSignature(raw, `t=${stamp},v1=invalid,v1=${signature}`, 'test-secret', now), true);
  assert.equal(verifyStripeSignature(Buffer.from('{}'), `t=${stamp},v1=${signature}`, 'test-secret', now), false);
  assert.equal(verifyStripeSignature(raw, `t=${stamp},v1=${signature}`, 'test-secret', now + 301000), false);
  assert.equal(verifyStripeSignature(raw, `t=${stamp},v1=${signature}`, 'wrong-secret', now), false);
});
test('editorial schema rejects executable URLs and email HTML escapes user content', () => {
  const input = { title: 'Mi primera tarjeta', summary: 'Un ejemplo editorial para aprender a revisar condiciones.',
    category: 'Antes de contratar', author: 'Responsable de prueba', body: '<script>alert(1)</script>\n\n' + 'Contenido educativo. '.repeat(8),
    sources: [{ title: 'Fuente', url: 'https://example.com' }], is_sample: true };
  assert.equal(editionSchema.safeParse({ ...input, sources: [{ title: 'Ataque', url: 'javascript:alert(1)' }] }).success, false);
  assert.equal(editionSchema.safeParse({ ...input, sources: [] }).success, false);
  const html = emailHtml(editionSchema.parse(input));
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('&lt;script&gt;'), true);
  assert.equal(html.includes('{{{RESEND_UNSUBSCRIBE_URL}}}'), true);
  assert.equal(html.includes('Billete Bajo Control'), true);
});
