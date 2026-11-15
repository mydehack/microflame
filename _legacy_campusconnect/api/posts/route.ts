import { NextResponse, type NextRequest } from "next/server";
import { postSchema } from "@/lib/validation";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { enforceUserRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view the feed.", 401);

  const requestedUser = request.nextUrl.searchParams.get("userId");
  let postQuery = supabase.from("posts").select("id,user_id,content,post_type,visibility,created_at").is("deleted_at", null);
  if (requestedUser) postQuery = postQuery.eq("user_id", requestedUser);
  const { data: posts, error } = await postQuery.order("created_at", { ascending: false }).limit(30);
  if (error) return jsonError("The feed could not be loaded.", 500);
  const visiblePosts = posts ?? [];
  const ids = [...new Set(visiblePosts.map((post) => post.user_id))];
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id,username,full_name,college,avatar_path,is_platform_badge").in("id", ids) : { data: [] };
  const { data: likes } = visiblePosts.length ? await supabase.from("post_likes").select("post_id,user_id").in("post_id", visiblePosts.map((post) => post.id)) : { data: [] };
  const { data: saved } = visiblePosts.length ? await supabase.from("saved_posts").select("post_id").eq("user_id", user.id).in("post_id", visiblePosts.map((post) => post.id)) : { data: [] };
  const authors = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const postLikes = new Map<string, { count: number; liked: boolean }>();
  const savedIds = new Set((saved ?? []).map((item) => item.post_id));
  for (const like of likes ?? []) {
    const value = postLikes.get(like.post_id) ?? { count: 0, liked: false };
    value.count += 1;
    value.liked ||= like.user_id === user.id;
    postLikes.set(like.post_id, value);
  }

  return NextResponse.json({ posts: visiblePosts.map((post) => ({
    ...post,
    author: authors.get(post.user_id) ?? null,
    likes: postLikes.get(post.id) ?? { count: 0, liked: false },
    saved: savedIds.has(post.id),
  })) });
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = postSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError(input.error.issues[0]?.message ?? "Enter a post before sharing.", 400);

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to create a post.", 401);
  try {
    if (!await enforceUserRateLimit(user.id, "posts", 10, 3600)) return jsonError("You have shared several posts recently. Please wait before posting again.", 429);
  } catch {
    return jsonError("Post creation is temporarily unavailable.", 503);
  }
  const { data, error } = await supabase.from("posts").insert({
    user_id: user.id, content: input.data.content, post_type: input.data.postType, visibility: input.data.visibility,
  }).select("id,user_id,content,post_type,visibility,created_at").single();
  if (error || !data) return jsonError("Your post could not be shared.", 500);
  return NextResponse.json({ post: data }, { status: 201 });
}
