import { NextResponse, type NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation";
import { requireSameOrigin } from "@/lib/http";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdminEnv, getSupabasePublicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SUCCESS_MESSAGE = "If an account matches that email or username, password reset instructions have been dispatched.";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  try {
    const allowed = await enforceAuthRateLimit(request, "login");
    if (!allowed) {
      return NextResponse.json({ error: "Too many recovery attempts. Please try again later." }, { status: 429 });
    }
  } catch {
    // In dev allow
  }

  const rawJson = await request.json().catch(() => null);
  const input = forgotPasswordSchema.safeParse(rawJson);
  if (!input.success) {
    return NextResponse.json({ error: "Please enter a valid email address or username." }, { status: 400 });
  }

  const { identifier } = input.data;
  const isEmail = identifier.includes("@");

  const adminEnv = getSupabaseAdminEnv();
  const publicEnv = getSupabasePublicEnv();

  if (adminEnv && publicEnv) {
    try {
      let emailToSend = identifier;
      if (!isEmail) {
        const admin = createSupabaseAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("username", identifier.toLowerCase())
          .maybeSingle();

        if (profile) {
          const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
          if (authUser?.user?.email) {
            emailToSend = authUser.user.email;
          }
        }
      }

      if (emailToSend.includes("@")) {
        const supabase = await createSupabaseServerClient();
        await supabase.auth.resetPasswordForEmail(emailToSend, {
          redirectTo: `${request.nextUrl.origin}/settings`,
        });
      }
    } catch (err: any) {
      console.warn("Forgot password handling:", err?.message);
    }
  }

  return NextResponse.json({
    ok: true,
    message: SUCCESS_MESSAGE,
  });
}

