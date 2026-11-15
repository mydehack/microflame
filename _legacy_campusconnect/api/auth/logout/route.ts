import { NextResponse, type NextRequest } from "next/server";
import { requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) return NextResponse.json({ error: "Your sessions could not be revoked. Please try signing out again." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
