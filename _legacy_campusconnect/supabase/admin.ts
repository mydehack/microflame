import { createClient } from "@supabase/supabase-js";
import { getRequiredSupabaseAdminEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getRequiredSupabaseAdminEnv();
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
