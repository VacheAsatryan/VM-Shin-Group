import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";
import type { Database } from "./types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates or retrieves a single instance of Supabase browser client for Client Components.
 */
export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } = getSupabaseEnv();

  browserClient = createBrowserClient<Database>(url, publishableKey);
  return browserClient;
}
