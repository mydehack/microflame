import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { enforceUserRateLimit } from "@/lib/rate-limit";
import { createRecoveryCode, hashRecoveryCode, sendRecoveryCode } from "@/lib/recovery-email";
import { getRequiredSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const recoverySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), email: z.string().trim().email().max(254), currentPassword: z.string().min(10).max(128) }),
  z.object({ action: z.literal("verify"), email: z.string().trim().email().max(254), code: z.string().regex(/^\d{6}$/) }),
]);

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view recovery settings.", 401);
  const { data, error } = await supabase.from("account_recovery").select("email,verified_at").eq("user_id", user.id).maybeSingle();
  if (error) return jsonError("Recovery settings could not be loaded.", 500);
  return NextResponse.json({ recovery: data });
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = recoverySchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Check the recovery email or verification code.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to manage recovery settings.", 401);
  const admin = createSupabaseAdminClient();

  if (input.data.action === "send") {
    const email = input.data.email.toLocaleLowerCase();
    try {
      if (!await enforceUserRateLimit(user.id, "recovery-enroll-auth", 6, 900)) return jsonError("Too many attempts. Please wait before trying again.", 429);
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      if (!profile) return jsonError("Your profile could not be verified.", 401);
      const { url, key } = getRequiredSupabaseAdminEnv();
      const verifier = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
      const { error: passwordError } = await verifier.auth.signInWithPassword({ email: `${profile.username}@accounts.campusconnect.invalid`, password: input.data.currentPassword });
      if (passwordError) return jsonError("Enter your current password to add or change a recovery email.", 401);
      const { error: signOutError } = await verifier.auth.signOut({ scope: "local" });
      if (signOutError) return jsonError("Password verification could not be completed. Try again.", 503);
      if (!await enforceUserRateLimit(user.id, "recovery-enroll", 4, 3600)
        || !await enforceUserRateLimit(email, "recovery-email", 2, 3600)) {
        return jsonError("A recovery code was requested recently. Please wait before trying again.", 429);
      }
      const code = createRecoveryCode();
      const { error } = await admin.rpc("begin_recovery_challenge", {
        p_user_id: user.id, p_email: email, p_purpose: "enroll",
        p_code_hash: hashRecoveryCode(user.id, email, "enroll", code),
      });
      if (error) throw new Error("Challenge could not be stored.");
      await sendRecoveryCode(email, code, "enroll");
      return NextResponse.json({ ok: true, message: "If the address can receive mail, a verification code is on its way." });
    } catch {
      return jsonError("Recovery verification could not be completed. Check the server settings and try again later.", 503);
    }
  }

  try {
    if (!await enforceUserRateLimit(user.id, "recovery-verify", 10, 900)) return jsonError("Too many verification attempts. Request a new code later.", 429);
    const email = input.data.email.toLocaleLowerCase();
    const { data: verified, error } = await admin.rpc("consume_recovery_challenge", {
      p_user_id: user.id, p_email: email, p_purpose: "enroll",
      p_code_hash: hashRecoveryCode(user.id, email, "enroll", input.data.code),
    });
    if (error || verified !== true) return jsonError("That code is invalid or expired. Request a new one and try again.", 400);
    return NextResponse.json({ ok: true, email });
  } catch {
    return jsonError("Recovery verification is temporarily unavailable.", 503);
  }
}
