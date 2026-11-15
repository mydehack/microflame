import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { enforceUserRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const followSchema = z.object({ userId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = followSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Choose a student to follow.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to follow students.", 401);
  try {
    if (!await enforceUserRateLimit(user.id, "follows", 40, 3600)) return jsonError("You have made several follow requests recently. Please try again later.", 429);
  } catch {
    return jsonError("Follow updates are temporarily unavailable.", 503);
  }
  if (input.data.userId === user.id) return jsonError("You cannot follow your own profile.", 400);

  const { data: existing } = await supabase.from("follows").select("followed_id").eq("follower_id", user.id).eq("followed_id", input.data.userId).maybeSingle();
  if (existing) return NextResponse.json({ status: "following" });
  const { data: existingRequest } = await supabase.from("follow_requests").select("status").eq("requester_id", user.id).eq("recipient_id", input.data.userId).maybeSingle();
  if (existingRequest?.status === "pending") return NextResponse.json({ status: "requested" });
  if (existingRequest?.status === "accepted") return NextResponse.json({ status: "following" });
  if (existingRequest?.status === "rejected") return jsonError("That follow request was previously declined.", 409);
  const { data: profile } = await supabase.from("profiles").select("id,visibility").eq("id", input.data.userId).maybeSingle();
  if (profile?.visibility === "public") {
    const { error } = await supabase.from("follows").upsert({ follower_id: user.id, followed_id: input.data.userId }, { onConflict: "follower_id,followed_id", ignoreDuplicates: true });
    if (error) return jsonError("You could not follow that student. They may have blocked your account.", 403);
    return NextResponse.json({ status: "following" });
  }
  const { error } = await supabase.from("follow_requests").insert({ requester_id: user.id, recipient_id: input.data.userId, status: "pending" });
  if (error) return jsonError("A follow request could not be sent.", 403);
  return NextResponse.json({ status: "requested" });
}

export async function DELETE(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = followSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Choose a student to unfollow.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to manage follows.", 401);
  const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("followed_id", input.data.userId);
  if (error) return jsonError("That follow could not be removed.", 500);
  return NextResponse.json({ status: "not_following" });
}
