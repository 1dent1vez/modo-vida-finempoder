export interface SecurityPolicyEnv {
  VITE_SUPABASE_URL?: string;
  VITE_API_URL?: string;
  VITE_SENTRY_DSN?: string;
}

export function buildContentSecurityPolicy(
  env: SecurityPolicyEnv,
  options?: { frameAncestors?: boolean },
): string;
