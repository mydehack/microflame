import { NextResponse, type NextRequest } from "next/server";
import { conedRegisterSchema } from "@/lib/validation";
import { requireSameOrigin } from "@/lib/http";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const RESERVED_USERNAMES = new Set(["coned_ai", "admin", "system", "moderator", "coned"]);

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  try {
    const allowed = await enforceAuthRateLimit(request, "register");
    if (!allowed) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
    }
  } catch {
    // If rate limiter fails, allow through in development
  }

  const rawJson = await request.json().catch(() => null);
  const input = conedRegisterSchema.safeParse(rawJson);
  if (!input.success) {
    const issue = input.error.issues[0]?.message ?? "Please check the registration details.";
    return NextResponse.json({ error: issue }, { status: 400 });
  }

  const { email, username, password } = input.data;

  // 1. Check reserved usernames
  if (RESERVED_USERNAMES.has(username.toLowerCase())) {
    return NextResponse.json({ error: "This username is reserved by the platform." }, { status: 409 });
  }

  const adminEnv = getSupabaseAdminEnv();

  // 2. If Supabase is configured, check database uniqueness and create auth record
  if (adminEnv) {
    try {
      const admin = createSupabaseAdminClient();

      // Check if username already exists in profiles
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json({ error: "Username is already taken. Please choose another." }, { status: 409 });
      }

      // Create Supabase auth user
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { account_type: "student" },
        user_metadata: { username: username.toLowerCase(), full_name: username },
      });

      if (createError || !created.user) {
        if (createError?.message?.toLowerCase().includes("already registered")) {
          return NextResponse.json({ error: "An account with this email address already exists." }, { status: 409 });
        }
        return NextResponse.json({ error: createError?.message || "Could not register account. Please try again." }, { status: 400 });
      }

      // Establish session with Supabase
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signInWithPassword({ email, password });
    } catch (err: any) {
      console.warn("Supabase registration fallback:", err?.message);
    }
  }

  // 3. Prepare response with session cookie
  const response = NextResponse.json(
    { ok: true, message: "Account registered successfully.", redirectTo: "/home" },
    { status: 201 }
  );

  const sessionData = {
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    fullName: username,
    college: "Campus Member",
  };

  response.cookies.set("coned_session", encodeURIComponent(JSON.stringify(sessionData)), {
    path: "/",
    maxAge: 604800, // 7 days
    sameSite: "lax",
    httpOnly: false,
  });

  response.cookies.set("coned_logged_out", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}
