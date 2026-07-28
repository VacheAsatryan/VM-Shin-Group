export interface SupabaseEnvConfig {
  url: string;
  publishableKey: string;
  isConfigured: boolean;
}

export function getSupabaseEnv(): SupabaseEnvConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  const isConfigured = Boolean(url.trim() && publishableKey.trim());

  return {
    url,
    publishableKey,
    isConfigured,
  };
}
