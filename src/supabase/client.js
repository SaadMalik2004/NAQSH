import { createClient } from "@supabase/supabase-js";

// Only the PUBLIC anon key belongs in the browser. Row Level Security in the
// database is what protects the data. NEVER put the service_role key here.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes("your-project-ref")
);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) throw new Error("BACKEND_NOT_CONFIGURED");
  return supabase;
}
