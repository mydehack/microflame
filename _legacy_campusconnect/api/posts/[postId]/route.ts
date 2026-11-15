import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { postSchema } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = postSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError(input.error.issues[0]?.message ?? "Check your post and try again.", 400);
  const { postId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to edit a post.", 401);
  const { data, error } = await supabase.from("posts").update({
    content: input.data.content,
    post_type: input.data.postType,
    visibility: input.data.visibility,
  }).eq("id", postId).eq("user_id", user.id).select("id,content,post_type,visibility,updated_at").maybeSingle();
  if (error || !data) return jsonError("That post could not be updated.", 403);
  return NextResponse.json({ post: data });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const { postId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to delete a post.", 401);
  const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", user.id);
  if (error) return jsonError("That post could not be deleted.", 500);
  return NextResponse.json({ ok: true });
}
