import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const communitySchema = z.object({ name: z.string().trim().min(2).max(100), description: z.string().trim().max(1000).default(""), visibility: z.enum(["public","private"]).default("public") });
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view communities.", 401);
  const { data: communities, error } = await supabase.from("communities").select("id,owner_id,name,description,visibility,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) return jsonError("Communities could not be loaded.", 500);
  const ids = (communities ?? []).map((group) => group.id);
  const [membersResult, pendingResult, ownerResult, ownMembershipResult] = ids.length ? await Promise.all([
    supabase.from("community_members").select("community_id,user_id,status").in("community_id", ids).eq("status", "accepted"),
    supabase.from("community_members").select("community_id,user_id").in("community_id", ids).eq("status", "pending"),
    supabase.from("profiles").select("id,full_name,username").in("id", [...new Set((communities ?? []).map((group) => group.owner_id))]),
    supabase.from("community_members").select("community_id,status,role").eq("user_id", user.id).in("community_id", ids),
  ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];
  if (membersResult.error || pendingResult.error || ownerResult.error || ownMembershipResult.error) return jsonError("Community details could not be loaded.", 500);
  const counts = new Map<string, number>();
  for (const member of membersResult.data ?? []) counts.set(member.community_id, (counts.get(member.community_id) ?? 0) + 1);
  const owners = new Map((ownerResult.data ?? []).map((profile) => [profile.id, profile]));
  const membership = new Map((ownMembershipResult.data ?? []).map((item) => [item.community_id, item]));
  const pending = new Map<string, string[]>();
  for (const request of pendingResult.data ?? []) pending.set(request.community_id, [...(pending.get(request.community_id) ?? []), request.user_id]);
  return NextResponse.json({ communities: (communities ?? []).map((group) => ({
    ...group,
    memberCount: group.visibility === "public" || group.owner_id === user.id ? counts.get(group.id) ?? 0 : null,
    owner: owners.get(group.owner_id) ?? null,
    membership: membership.get(group.id) ?? null,
    pendingRequests: group.owner_id === user.id ? pending.get(group.id) ?? [] : [],
  })) });
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = communitySchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError(input.error.issues[0]?.message ?? "Check the community details.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to create a community.", 401);
  const { data, error } = await supabase.from("communities").insert({ owner_id: user.id, ...input.data }).select("id,name,description,visibility,created_at,owner_id").single();
  if (error || !data) return jsonError("The community could not be created.", 400);
  return NextResponse.json({ community: data }, { status: 201 });
}
