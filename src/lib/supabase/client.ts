import { createBrowserClient } from "@supabase/ssr";

function getPublishableKey(): string {
  // Supabase now issues `sb_publishable_` keys under PUBLISHABLE_KEY;
  // legacy projects still use ANON_KEY (JWT). Accept either.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    // Avoid throwing at import time; surface at runtime with a clear message
    console.warn(
      "[supabase/client] Missing publishable key: set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (new) or NEXT_PUBLIC_SUPABASE_ANON_KEY (legacy)"
    );
  }
  return key ?? "";
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublishableKey()
  );
}
