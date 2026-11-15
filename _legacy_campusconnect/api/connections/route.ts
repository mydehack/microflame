import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { enforceUserRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const connectionSchema = z.object({ userId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = connectionSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Choose a student to connect with.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to connect.", 401);
  try {
    if (!await enforceUserRateLimit(user.id, "connections", 20, 3600)) return jsonError("You have sent several connection requests recently. Please try again later.", 429);
  } catch {
    return jsonError("Connection requests are temporarily unavailable.", 503);
  }
  if (input.data.userId === user.id) return jsonError("You cannot connect with your own profile.", 400);
  const { data: existing, error: existingError } = await supabase.from("connections").select("id,status").or("and(requester_id.eq." + user.id + ",recipient_id.eq." + input.data.userId + "),and(requester_id.eq." + input.data.userId + ",recipient_id.eq." + user.id + ")").limit(1).maybeSingle();
  if (existingError) return jsonError("Connection details could not be checked.", 500);
  if (existing?.status === "accepted") return NextResponse.json({ status: "connected" });
  if (existing?.status === "pending") return NextResponse.json({ status: "requested" });
  if (existing?.status === "rejected") return jsonError("That connection request was previously declined.", 409);
  if (existing?.status === "cancelled") return jsonError("That connection request was cancelled and cannot be reopened.", 409);
  const { error } = await supabase.from("connections").insert({ requester_id: user.id, recipient_id: input.data.userId, status: "pending" });
  if (error) return jsonError("A connection request could not be sent. The student may not be accepting requests.", 403);
  return NextResponse.json({ status: "requested" }, { status: 201 });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view connections.", 401);
  const { data: requests, error } = await supabase.from("connections").select("id,requester_id,recipient_id,status,created_at").or("requester_id.eq." + user.id + ",recipient_id.eq." + user.id).order("created_at", { ascending: false }).limit(100);
  if (error) return jsonError("Connections could not be loaded.", 500);
  const otherIds = [...new Set((requests ?? []).map((item) => item.requester_id === user.id ? item.recipient_id : item.requester_id))];
  const { data: profiles } = otherIds.length ? await supabase.from("profiles").select("id,username,full_name,college,avatar_path,is_platform_badge").in("id", otherIds) : { data: [] };
  const map = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const all = (requests ?? []).map((item) => ({ ...item, incoming: item.recipient_id === user.id, person: map.get(item.requester_id === user.id ? item.recipient_id : item.requester_id) ?? null }));
  return NextResponse.json({ incoming: all.filter((item) => item.incoming && item.status === "pending"), outgoing: all.filter((item) => !item.incoming && item.status === "pending"), connections: all.filter((item) => item.status === "accepted") });
}
