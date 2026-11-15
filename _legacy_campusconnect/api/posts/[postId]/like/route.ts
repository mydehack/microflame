import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { enforceUserRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const { postId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to like a post.", 401);
  try {
    if (!await enforceUserRateLimit(user.id, "likes", 120, 600)) return jsonError("You have updated several reactions recently. Please try again later.", 429);
  } catch {
    return jsonError("Reactions are temporarily unavailable.", 503);
  }
  const { data: existing, error: readError } = await supabase.from("post_likes").select("post_id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
  if (readError) return jsonError("That post is no longer available.", 404);
  if (existing) {
    const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    if (error) return jsonError("Your reaction could not be updated.", 500);
    return NextResponse.json({ liked: false });
  }
  const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  if (error) return jsonError("Your reaction could not be added.", 500);
  return NextResponse.json({ liked: true });
}
