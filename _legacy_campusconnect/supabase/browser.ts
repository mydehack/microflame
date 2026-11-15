"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getRequiredSupabasePublicEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, key } = getRequiredSupabasePublicEnv();
    browserClient = createBrowserClient<Database>(url, key);
  }
  return browserClient;
}
