import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Cliente de Supabase con service role key.
 * Bypasa RLS — úsalo solo en el backend con requests ya autenticados.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
