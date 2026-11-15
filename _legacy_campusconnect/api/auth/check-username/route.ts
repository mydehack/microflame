import { NextResponse, type NextRequest } from "next/server";
import { usernameSchema } from "@/lib/validation";
import { getSupabaseAdminEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const RESERVED = new Set(["coned_ai", "admin", "system", "moderator", "coned"]);

export async function GET(request: NextRequest) {
  const usernameParam = request.nextUrl.searchParams.get("username") || "";
  const parsed = usernameSchema.safeParse(usernameParam);

  if (!parsed.success) {
    return NextResponse.json({
      available: false,
      error: "Username must be 3–24 lowercase letters, numbers, or underscores.",
    });
  }

  const username = parsed.data;

  if (RESERVED.has(username)) {
    return NextResponse.json({
      available: false,
      error: "This username is reserved.",
    });
  }

  const adminEnv = getSupabaseAdminEnv();
  if (adminEnv) {
    try {
      const admin = createSupabaseAdminClient();
      const { data } = await admin
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (data) {
        return NextResponse.json({
          available: false,
          error: "Username is already taken.",
        });
      }
    } catch {
      // Fall through to available
    }
  }

  return NextResponse.json({
    available: true,
    message: "Username is available!",
  });
}

