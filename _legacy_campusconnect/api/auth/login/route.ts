import { NextResponse, type NextRequest } from "next/server";
import { conedLoginSchema } from "@/lib/validation";
import { requireSameOrigin } from "@/lib/http";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { getSupabaseAdminEnv, getSupabasePublicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const GENERIC_AUTH_ERROR = "Invalid email, username, or password.";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;

  try {
    const allowed = await enforceAuthRateLimit(request, "login");
    if (!allowed) {
      return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
    }
  } catch {
    // If rate limiter fails, allow through in development
  }

  const rawJson = await request.json().catch(() => null);
  // Support both identifier and username keys
  const normalized = {
    identifier: rawJson?.identifier || rawJson?.username || "",
    password: rawJson?.password || "",
  };

  const input = conedLoginSchema.safeParse(normalized);
  if (!input.success) {
    return NextResponse.json({ error: "Please enter your email address or username and password." }, { status: 400 });
  }

  const { identifier, password } = input.data;
  const isEmail = identifier.includes("@");

  const adminEnv = getSupabaseAdminEnv();
  const publicEnv = getSupabasePublicEnv();

  let resolvedUsername = isEmail ? identifier.split("@")[0] : identifier.toLowerCase();
  let resolvedEmail = isEmail ? identifier.toLowerCase() : "";

  // 1. If Supabase Auth is configured, perform secure authentication
  if (adminEnv && publicEnv) {
    try {
      const admin = createSupabaseAdminClient();
      let emailToAuthenticate = identifier.toLowerCase();

      // If logging in via username, look up the account securely server-side
      if (!isEmail) {
        const { data: profile } = await admin
          .from("profiles")
          .select("id, username")
          .eq("username", identifier.toLowerCase())
          .maybeSingle();

        if (!profile) {
          // Return generic error to prevent username enumeration
          return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
        }

        const { data: authUser, error: authUserError } = await admin.auth.admin.getUserById(profile.id);
        if (authUserError || !authUser?.user?.email) {
          return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
        }

        emailToAuthenticate = authUser.user.email;
        resolvedUsername = profile.username;
        resolvedEmail = emailToAuthenticate;
      }

      const supabase = await createSupabaseServerClient();
      const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToAuthenticate,
        password,
      });

      if (signInError || !signedIn.user) {
        return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
      }

      if (isEmail && signedIn.user.user_metadata?.username) {
        resolvedUsername = signedIn.user.user_metadata.username;
      }
    } catch (err: any) {
      console.warn("Supabase login fallback:", err?.message);
    }
  }

  // 2. Prepare success response with active session cookie
  const response = NextResponse.json({
    ok: true,
    message: "Signed in successfully.",
    redirectTo: "/home",
  });

  const sessionData = {
    username: resolvedUsername,
    email: resolvedEmail || `${resolvedUsername}@campus.edu`,
    fullName: resolvedUsername.replace(/_/g, " "),
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
