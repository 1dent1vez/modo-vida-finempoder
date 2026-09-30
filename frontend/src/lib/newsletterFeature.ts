export function newsletterEnabled() {
  const configured = import.meta.env.VITE_NEWSLETTER_ENABLED;
  return configured === undefined ? !import.meta.env.PROD : configured === 'true';
}
