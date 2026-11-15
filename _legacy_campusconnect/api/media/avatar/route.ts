import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path || path.length > 500 || path.startsWith("/") || path.includes("..")) return new NextResponse(null, { status: 404 });
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("id").eq("avatar_path", path).maybeSingle();
  if (!profile) return new NextResponse(null, { status: 404 });
  const { data, error } = await supabase.storage.from("profile-media").createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return new NextResponse(null, { status: 404 });
  const response = NextResponse.redirect(data.signedUrl, 302);
  response.headers.set("cache-control", "private, no-store");
  return response;
}
