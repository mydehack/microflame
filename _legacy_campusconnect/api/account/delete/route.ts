import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { getRequiredSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const deleteSchema = z.object({ confirmation: z.literal("DELETE"), currentPassword: z.string().min(10).max(128) });

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Type DELETE and enter your current password to continue.", 400);
  try {
    if (!await enforceAuthRateLimit(request, "login")) return jsonError("Too many attempts. Please try again later.", 429);
  } catch {
    return jsonError("Account deletion is temporarily unavailable.", 503);
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in again before deleting your account.", 401);
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
  if (!profile) return jsonError("Your account profile could not be verified.", 401);
  const { url, key } = getRequiredSupabaseAdminEnv();
  const verifier = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
  const { error: passwordError } = await verifier.auth.signInWithPassword({ email: profile.username + "@accounts.campusconnect.invalid", password: input.data.currentPassword });
  if (passwordError) return jsonError("The current password was not recognized.", 401);
  const admin = createSupabaseAdminClient();
  for (const bucket of ["profile-media", "post-media"]) {
    const paths = await listStorageTree(admin, bucket, user.id);
    if (paths === null) return jsonError("Account media could not be removed, so deletion was not completed. Try again later.", 503);
    for (let offset = 0; offset < paths.length; offset += 100) {
      const { error } = await admin.storage.from(bucket).remove(paths.slice(offset, offset + 100));
      if (error) return jsonError("Account media could not be removed, so deletion was not completed. Try again later.", 503);
    }
  }
  const { error: signOutError } = await supabase.auth.signOut({ scope: "global" });
  if (signOutError) return jsonError("Your sessions could not be revoked, so the account was not deleted.", 503);
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return jsonError("Your sessions were revoked, but account deletion did not finish. Contact support before signing in again.", 503);
  return NextResponse.json({ ok: true, deleted: true });
}

async function listStorageTree(admin: ReturnType<typeof createSupabaseAdminClient>, bucket: string, root: string): Promise<string[] | null> {
  const paths: string[] = [];
  async function visit(prefix: string, depth: number): Promise<boolean> {
    if (depth > 12) return false;
    let offset = 0;
    while (true) {
      const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
      if (error) return false;
      const entries = data ?? [];
      for (const entry of entries) {
        const path = `${prefix}/${entry.name}`;
        if (entry.id) paths.push(path);
        else if (!await visit(path, depth + 1)) return false;
      }
      if (entries.length < 100) break;
      offset += entries.length;
    }
    return true;
  }
  return await visit(root, 0) ? paths : null;
}
