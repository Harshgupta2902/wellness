import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Used in server actions and server components.
 * Untyped for flexibility — type safety is enforced at the action level.
 */
export function createServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
