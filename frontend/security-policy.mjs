const requiredOrigin = (value, name) => {
  if (!value) throw new Error(`${name} es obligatorio para generar la CSP`);
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error(`${name} debe usar HTTPS`);
  return url.origin;
};

export function buildContentSecurityPolicy(env, { frameAncestors = false } = {}) {
  const supabase = requiredOrigin(env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL');
  const api = requiredOrigin(env.VITE_API_URL, 'VITE_API_URL');
  const websocket = supabase.replace(/^https:/, 'wss:');
  const sentry = env.VITE_SENTRY_DSN
    ? requiredOrigin(env.VITE_SENTRY_DSN, 'VITE_SENTRY_DSN')
    : null;
  const connect = ["'self'", supabase, websocket, api, 'https://us.i.posthog.com', sentry]
    .filter(Boolean)
    .join(' ');

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connect}`,
    "worker-src 'self' blob:",
    "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
    ...(frameAncestors ? ["frame-ancestors 'none'"] : []),
    'upgrade-insecure-requests',
  ].join('; ');
}
