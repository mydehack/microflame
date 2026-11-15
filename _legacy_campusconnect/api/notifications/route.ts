import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view notifications.", 401);
  const { data: notifications, error } = await supabase.from("notifications").select("id,actor_id,notification_type,entity_id,body,read_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  if (error) return jsonError("Notifications could not be loaded.", 500);
  const actorIds = [...new Set((notifications ?? []).map((item) => item.actor_id).filter((id): id is string => Boolean(id)))];
  const { data: actors } = actorIds.length ? await supabase.from("profiles").select("id,username,full_name,avatar_path").in("id", actorIds) : { data: [] };
  const people = new Map((actors ?? []).map((person) => [person.id, person]));
  return NextResponse.json({ notifications: (notifications ?? []).map((item) => ({ ...item, actor: item.actor_id ? people.get(item.actor_id) ?? null : null })) });
}

export async function PATCH(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to update notifications.", 401);
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  if (error) return jsonError("Notifications could not be marked as read.", 500);
  return NextResponse.json({ ok: true });
}
