import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const { postId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to save posts.", 401);
  const { data: existing, error: readError } = await supabase.from("saved_posts").select("post_id").eq("user_id", user.id).eq("post_id", postId).maybeSingle();
  if (readError) return jsonError("That post could not be saved.", 404);
  if (existing) {
    const { error } = await supabase.from("saved_posts").delete().eq("user_id", user.id).eq("post_id", postId);
    if (error) return jsonError("That post could not be removed from saved posts.", 500);
    return NextResponse.json({ saved: false });
  }
  const { error } = await supabase.from("saved_posts").insert({ user_id: user.id, post_id: postId });
  if (error) return jsonError("That post could not be saved.", 500);
  return NextResponse.json({ saved: true });
}
