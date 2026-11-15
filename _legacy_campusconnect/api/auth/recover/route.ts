import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { enforceAuthRateLimit, enforceUserRateLimit } from "@/lib/rate-limit";
import { createRecoveryCode, hashRecoveryCode, sendRecoveryCode } from "@/lib/recovery-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const recoverSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/) }),
  z.object({ action: z.literal("reset"), username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/), code: z.string().regex(/^\d{6}$/), password: z.string().min(10).max(128) }),
]);
const genericMessage = "If this username has a verified recovery email, a code will be sent.";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = recoverSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Check your username, verification code, or new password.", 400);
  try {
    if (!await enforceAuthRateLimit(request, "register")) return jsonError("Too many recovery attempts. Please try again later.", 429);
  } catch {
    return jsonError("Password recovery is temporarily unavailable.", 503);
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from("profiles").select("id").eq("username", input.data.username).maybeSingle();
  if (!profile) return input.data.action === "send"
    ? NextResponse.json({ ok: true, message: genericMessage })
    : jsonError("That code is invalid or expired. Request a new one and try again.", 400);
  const { data: recovery } = await admin.from("account_recovery").select("email").eq("user_id", profile.id).maybeSingle();
  if (!recovery) return input.data.action === "send"
    ? NextResponse.json({ ok: true, message: genericMessage })
    : jsonError("That code is invalid or expired. Request a new one and try again.", 400);

  if (input.data.action === "send") {
    try {
      if (!await enforceUserRateLimit(profile.id, "recovery-reset-send", 3, 3600)
        || !await enforceUserRateLimit(recovery.email, "recovery-email", 2, 3600)) {
        return NextResponse.json({ ok: true, message: genericMessage });
      }
      const code = createRecoveryCode();
      const { error } = await admin.rpc("begin_recovery_challenge", {
        p_user_id: profile.id, p_email: recovery.email, p_purpose: "reset",
        p_code_hash: hashRecoveryCode(profile.id, recovery.email, "reset", code),
      });
      if (error) throw new Error("Recovery challenge could not be stored.");
      await sendRecoveryCode(recovery.email, code, "reset");
    } catch {
      // Keep the response the same for unknown usernames and mail delivery failures.
    }
    return NextResponse.json({ ok: true, message: genericMessage });
  }

  try {
    if (!await enforceUserRateLimit(profile.id, "recovery-reset-verify", 8, 900)) return jsonError("That code is invalid or expired. Request a new one and try again.", 400);
    const { data: valid, error: verifyError } = await admin.rpc("consume_recovery_challenge", {
      p_user_id: profile.id, p_email: recovery.email, p_purpose: "reset",
      p_code_hash: hashRecoveryCode(profile.id, recovery.email, "reset", input.data.code),
    });
    if (verifyError || valid !== true) return jsonError("That code is invalid or expired. Request a new one and try again.", 400);
    const { error: passwordError } = await admin.auth.admin.updateUserById(profile.id, { password: input.data.password });
    if (passwordError) return jsonError("The password could not be changed. Request a new code and try again.", 503);
    const { error: revokeError } = await admin.rpc("revoke_user_sessions", { p_user_id: profile.id });
    if (revokeError) return jsonError("Your password changed, but existing sessions could not be revoked. Contact support.", 503);
    return NextResponse.json({ ok: true, passwordChanged: true });
  } catch {
    return jsonError("Password recovery is temporarily unavailable.", 503);
  }
}
