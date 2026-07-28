import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./config";
import type { Database } from "./types";

/**
 * Creates a server-only Supabase Admin client utilizing SUPABASE_SECRET_KEY.
 * Bypasses RLS to allow secure server-side insertions for public customer order submissions.
 * NEVER import this file in client components or expose it to the browser.
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey || !secretKey.trim()) {
    throw new Error(
      "[Supabase Admin Error] Mandatory environment variable SUPABASE_SECRET_KEY is missing or empty."
    );
  }

  return createClient<Database>(url, secretKey.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
