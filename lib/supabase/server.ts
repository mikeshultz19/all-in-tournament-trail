import "server-only";

import { createClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_ANON_KEY?.trim(),
  );
}

export function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
    );
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
