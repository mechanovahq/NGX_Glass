import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client using the service-role key.
 * This bypasses RLS — ONLY use in server-side API routes, never expose to the client.
 */
export function getAdminClient(): SupabaseClient {
  if (_admin) return _admin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase Dashboard → Settings → API).'
    );
  }

  _admin = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _admin;
}
