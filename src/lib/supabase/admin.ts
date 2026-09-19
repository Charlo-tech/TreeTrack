import { createClient } from "@supabase/supabase-js";

// Service-role / secret client — server only. Never import in client components.

function getServiceKey(): string | undefined {
  // Legacy: SUPABASE_SERVICE_ROLE_KEY (JWT)
  // New Supabase: SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY both work
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    undefined
  );
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // also support server-only SUPABASE_URL without NEXT_PUBLIC prefix
  const resolvedUrl = url ?? process.env.SUPABASE_URL;
  const key = getServiceKey();
  if (!resolvedUrl || !key) return null;
  return createClient(resolvedUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
