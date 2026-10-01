import assert from 'node:assert/strict';
import { buildContentSecurityPolicy } from '../security-policy.mjs';

const env = {
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_API_URL: 'https://api.example.com/api',
  VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
};
const metaPolicy = buildContentSecurityPolicy(env);
const headerPolicy = buildContentSecurityPolicy(env, { frameAncestors: true });

assert.match(metaPolicy, /connect-src 'self' https:\/\/example\.supabase\.co wss:\/\/example\.supabase\.co https:\/\/api\.example\.com/);
assert.match(headerPolicy, /https:\/\/example\.ingest\.sentry\.io/);
assert.match(headerPolicy, /frame-ancestors 'none'/);
assert.doesNotMatch(metaPolicy, /frame-ancestors/);
assert.throws(() => buildContentSecurityPolicy({ ...env, VITE_API_URL: 'http://api.example.com' }), /HTTPS/);

Object.assign(process.env, env);
const { config } = await import('../vercel.mjs');
const securityHeader = config.headers[0].headers.find((header) => header.key === 'Content-Security-Policy');
assert.equal(securityHeader?.value, headerPolicy);
assert.deepEqual(config.rewrites, [{ source: '/(.*)', destination: '/index.html' }]);
console.log('CSP de Vite y Vercel verificada');
