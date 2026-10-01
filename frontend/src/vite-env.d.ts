/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_ANALYTICS_DEBUG?: string;
  readonly VITE_NEWSLETTER_ENABLED?: string;
}

declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';
  import type { ComponentType } from 'react';
  const MDXComponent: ComponentType<MDXProps>;
  export default MDXComponent;
}
