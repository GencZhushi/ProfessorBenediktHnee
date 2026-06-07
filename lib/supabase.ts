import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase connection details.
 *
 * The URL and the "anon" (publishable) key are PUBLIC by design — they are
 * meant to be shipped to the browser. Security is enforced by the database:
 *  - Site settings are world-readable but can only be written through a
 *    password-protected database function (see lib/admin actions).
 *  - The admin password is verified inside Postgres and never stored here.
 *
 * Values fall back to the project defaults so the site works with no extra
 * environment configuration, but can be overridden via env vars if needed.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://cjbfvuargltcpejojaxv.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_yrfzhbAexI45jy4yXYm2HA_WbLCzYAO";

/** The storage bucket that holds uploaded photos and videos. */
export const MEDIA_BUCKET = "media";

/** Create a fresh Supabase client (used on the server, no session needed). */
export function createSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** A single shared client for use in the browser. */
let browserClient: SupabaseClient | null = null;
export function getBrowserSupabase(): SupabaseClient {
  if (!browserClient) browserClient = createSupabaseClient();
  return browserClient;
}
