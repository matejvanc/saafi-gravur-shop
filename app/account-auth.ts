import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AuthConfig = {
  url: string;
  publishableKey: string;
};

export async function loadAccountAuthClient(): Promise<SupabaseClient | null> {
  const response = await fetch("/api/auth-config", { cache: "no-store" });
  if (response.status === 503) return null;
  if (!response.ok) {
    throw new Error(`Authentication configuration request failed (${response.status}).`);
  }

  const config: unknown = await response.json();
  if (!isAuthConfig(config)) {
    throw new Error("Authentication configuration returned invalid data.");
  }

  return createClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
}

function isAuthConfig(value: unknown): value is AuthConfig {
  if (typeof value !== "object" || value === null) return false;

  const config = value as Record<string, unknown>;
  if (
    typeof config.url !== "string" ||
    typeof config.publishableKey !== "string" ||
    !config.publishableKey.trim()
  ) {
    return false;
  }

  try {
    const url = new URL(config.url);
    return (
      url.protocol === "https:" ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}
