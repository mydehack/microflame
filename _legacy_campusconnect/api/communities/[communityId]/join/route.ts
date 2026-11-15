import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, context: { params: Promise<{ communityId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const { communityId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to join a community.", 401);
  const { data: existing } = await supabase.from("community_members").select("status").eq("community_id", communityId).eq("user_id", user.id).maybeSingle();
  if (existing?.status === "accepted") return NextResponse.json({ status: "joined" });
  if (existing?.status === "pending") return NextResponse.json({ status: "requested" });
  const { data: community } = await createSupabaseAdminClient().from("communities").select("id,visibility").eq("id", communityId).maybeSingle();
  if (!community) return jsonError("That community is not available.", 404);
  const status = community?.visibility === "private" ? "pending" : "accepted";
  const { error } = await supabase.from("community_members").insert({ community_id: communityId, user_id: user.id, role: "member", status });
  if (error) return jsonError("You could not join that community. It may be private or unavailable.", 403);
  return NextResponse.json({ status: status === "pending" ? "requested" : "joined" }, { status: 201 });
}
