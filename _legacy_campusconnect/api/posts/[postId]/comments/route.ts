import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { enforceUserRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const commentSchema = z.object({ content: z.string().trim().min(1).max(2000), parentId: z.string().uuid().optional() });

export async function GET(_request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const { postId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view comments.", 401);
  const { data: comments, error } = await supabase.from("comments").select("id,user_id,content,parent_id,created_at").eq("post_id", postId).is("deleted_at", null).order("created_at").limit(100);
  if (error) return jsonError("Comments are unavailable for this post.", 404);
  const ids = [...new Set((comments ?? []).map((comment) => comment.user_id))];
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id,username,full_name,avatar_path,is_platform_badge").in("id", ids) : { data: [] };
  const authors = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  return NextResponse.json({ comments: (comments ?? []).map((comment) => ({ ...comment, author: authors.get(comment.user_id) ?? null })) });
}

export async function POST(request: NextRequest, context: { params: Promise<{ postId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = commentSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Write a comment before sending it.", 400);
  const { postId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to comment.", 401);
  try {
    if (!await enforceUserRateLimit(user.id, "comments", 30, 600)) return jsonError("You have added several comments recently. Please wait before commenting again.", 429);
  } catch {
    return jsonError("Comments are temporarily unavailable.", 503);
  }
  const { data, error } = await supabase.from("comments").insert({
    post_id: postId, user_id: user.id, content: input.data.content, parent_id: input.data.parentId ?? null,
  }).select("id,user_id,content,parent_id,created_at").single();
  if (error || !data) return jsonError("Your comment could not be added.", 500);
  const { data: author } = await supabase.from("profiles").select("id,username,full_name,avatar_path,is_platform_badge").eq("id", user.id).maybeSingle();
  return NextResponse.json({ comment: { ...data, author } }, { status: 201 });
}
