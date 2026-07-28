import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./config";
import type { Database } from "./types";

/**
 * Middleware session updater for Supabase SSR.
 * Refreshes session tokens and synchronizes cookies across request and response objects.
 */
export async function updateSession(
  request: NextRequest,
  response?: NextResponse
): Promise<NextResponse> {
  let supabaseResponse = response ?? NextResponse.next({ request });

  const { url, publishableKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = response ?? NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Calling getUser refreshes the auth session token if expired.
  await supabase.auth.getUser();

  return supabaseResponse;
}
